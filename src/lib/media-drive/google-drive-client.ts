import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export type DriveFileRef = {
  id: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
  planned_url?: string;
  parents?: string[];
  sizeBytes?: number;
  md5Checksum?: string;
};

export type FolderTreeResult = {
  created: DriveFileRef[];
  existing: DriveFileRef[];
  folder_map: Record<string, string>;
  live: boolean;
};

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type DriveFileApiResponse = {
  id?: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  parents?: string[];
  size?: string;
  md5Checksum?: string;
};

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

function plannedId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, '\n');
}

function base64UrlJson(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function escapeDriveQuery(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function asDriveFile(input: DriveFileApiResponse): DriveFileRef {
  return {
    id: input.id ?? 'unknown-drive-file',
    name: input.name ?? 'unnamed-drive-file',
    mimeType: input.mimeType,
    webViewLink: input.webViewLink,
    parents: input.parents,
    sizeBytes: input.size ? Number(input.size) : undefined,
    md5Checksum: input.md5Checksum
  };
}

async function getServiceAccountAccessToken() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const parsed = serviceAccountJson ? JSON.parse(serviceAccountJson) as { client_email?: string; private_key?: string } : undefined;
  const clientEmail = parsed?.client_email ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = parsed?.private_key ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKey) return undefined;

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: 'RS256', typ: 'JWT' });
  const claim = base64UrlJson({
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  });
  const signingInput = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(privateKey)).toString('base64url');
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const json = await response.json() as GoogleTokenResponse;
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description ?? json.error ?? `google_token_http_${response.status}`);
  }
  return json.access_token;
}

async function getAccessToken() {
  if (process.env.GOOGLE_DRIVE_ACCESS_TOKEN) return process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  return getServiceAccountAccessToken();
}

async function driveFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('missing_google_drive_credentials');

  const response = await fetch(`${DRIVE_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {})
    }
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = typeof json?.error?.message === 'string' ? json.error.message : `drive_http_${response.status}`;
    throw new Error(message);
  }
  return json as T;
}

export function isGoogleDriveLiveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_ACCESS_TOKEN ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  );
}

export class MediaDriveClient {
  readonly rootFolderId: string;
  readonly live: boolean;

  constructor(options: { rootFolderId?: string; live?: boolean } = {}) {
    this.rootFolderId = options.rootFolderId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr';
    this.live = options.live === true;
  }

  async createFolderTree(paths: string[], rootFolderId = this.rootFolderId): Promise<FolderTreeResult> {
    if (!this.live) {
      return {
        created: [],
        existing: paths.map((path, index) => ({
          id: `${rootFolderId}:planned-folder-${index}`,
          name: path,
          mimeType: 'application/vnd.google-apps.folder'
        })),
        folder_map: Object.fromEntries(paths.map((path, index) => [path, `${rootFolderId}:planned-folder-${index}`])),
        live: false
      };
    }

    const created: DriveFileRef[] = [];
    const existing: DriveFileRef[] = [];
    const folderMap: Record<string, string> = {};
    let parentId = rootFolderId;

    for (const rawPath of paths) {
      const parts = rawPath.split('/').map((part) => part.trim()).filter(Boolean);
      let currentPath = '';
      parentId = rootFolderId;

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (folderMap[currentPath]) {
          parentId = folderMap[currentPath];
          continue;
        }

        const query = [
          `name='${escapeDriveQuery(part)}'`,
          "mimeType='application/vnd.google-apps.folder'",
          `'${escapeDriveQuery(parentId)}' in parents`,
          'trashed=false'
        ].join(' and ');
        const list = await driveFetch<{ files?: DriveFileApiResponse[] }>(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,parents)&pageSize=1`);
        const found = list.files?.[0];

        if (found?.id) {
          const ref = asDriveFile(found);
          existing.push(ref);
          folderMap[currentPath] = ref.id;
          parentId = ref.id;
          continue;
        }

        const made = await driveFetch<DriveFileApiResponse>('/files?fields=id,name,mimeType,webViewLink,parents', {
          method: 'POST',
          body: JSON.stringify({
            name: part,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
          })
        });
        const ref = asDriveFile(made);
        created.push(ref);
        folderMap[currentPath] = ref.id;
        parentId = ref.id;
      }
    }

    return { created, existing, folder_map: folderMap, live: true };
  }

  async uploadFile(input: { sourceFileRef: string; filename: string; mimeType: string; folderId: string }) {
    if (!this.live) {
      const id = plannedId('planned-upload');
      return {
        id,
        name: input.filename,
        mimeType: input.mimeType,
        planned_url: `planned-drive-file:${id}`,
        parents: [input.folderId],
        sizeBytes: 0,
        sha256: 'planned',
        live: false
      };
    }

    const token = await getAccessToken();
    if (!token) throw new Error('missing_google_drive_credentials');

    const fileBytes = await readFile(input.sourceFileRef);
    const boundary = `auto_builder_media_drive_${Date.now()}`;
    const metadata = {
      name: input.filename,
      mimeType: input.mimeType,
      parents: [input.folderId]
    };
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
      Buffer.from(`--${boundary}\r\ncontent-type: ${input.mimeType}\r\n\r\n`),
      fileBytes,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const response = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,parents,size,md5Checksum`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': `multipart/related; boundary=${boundary}`
      },
      body
    });
    const json = await response.json();
    if (!response.ok) throw new Error(typeof json?.error?.message === 'string' ? json.error.message : `drive_upload_http_${response.status}`);
    return { ...asDriveFile(json), live: true };
  }

  async downloadFile(input: { fileId: string; destinationName?: string; exportMimeType?: string }) {
    if (!this.live) {
      return {
        local_file_ref: `/tmp/${input.destinationName ?? input.fileId}`,
        filename: input.destinationName ?? input.fileId,
        mime_type: input.exportMimeType ?? 'application/octet-stream',
        source_drive_file_id: input.fileId,
        live: false
      };
    }

    const metadata = await driveFetch<DriveFileApiResponse>(`/files/${encodeURIComponent(input.fileId)}?fields=id,name,mimeType`);
    const exportMimeType = input.exportMimeType;
    return {
      local_file_ref: `/tmp/${input.destinationName ?? metadata.name ?? input.fileId}`,
      filename: input.destinationName ?? metadata.name ?? input.fileId,
      mime_type: exportMimeType ?? metadata.mimeType ?? 'application/octet-stream',
      source_drive_file_id: input.fileId,
      export_url: exportMimeType
        ? `${DRIVE_API}/files/${encodeURIComponent(input.fileId)}/export?mimeType=${encodeURIComponent(exportMimeType)}`
        : `${DRIVE_API}/files/${encodeURIComponent(input.fileId)}?alt=media`,
      live: true,
      note: 'Download adapter resolved metadata and authorized export/media URL; caller should stream bytes in a runtime workspace when needed.'
    };
  }

  async moveFile(input: { fileId: string; toFolderId: string; fromFolderId?: string }) {
    if (!this.live) {
      return {
        file_id: input.fileId,
        previous_parent_ids: input.fromFolderId ? [input.fromFolderId] : [],
        new_parent_id: input.toFolderId,
        planned_url: `planned-drive-file:${input.fileId}`,
        live: false
      };
    }

    const removeParents = input.fromFolderId ? `&removeParents=${encodeURIComponent(input.fromFolderId)}` : '';
    const file = await driveFetch<DriveFileApiResponse>(`/files/${encodeURIComponent(input.fileId)}?addParents=${encodeURIComponent(input.toFolderId)}${removeParents}&fields=id,name,mimeType,webViewLink,parents`, {
      method: 'PATCH',
      body: JSON.stringify({})
    });
    return { ...asDriveFile(file), file_id: input.fileId, new_parent_id: input.toFolderId, live: true };
  }

  async moveFolder(input: { folderId: string; toFolderId: string; fromFolderId?: string }) {
    if (!this.live) {
      return {
        folder_id: input.folderId,
        previous_parent_ids: input.fromFolderId ? [input.fromFolderId] : [],
        new_parent_id: input.toFolderId,
        planned_url: `planned-drive-folder:${input.folderId}`,
        live: false
      };
    }

    const removeParents = input.fromFolderId ? `&removeParents=${encodeURIComponent(input.fromFolderId)}` : '';
    const folder = await driveFetch<DriveFileApiResponse>(`/files/${encodeURIComponent(input.folderId)}?addParents=${encodeURIComponent(input.toFolderId)}${removeParents}&fields=id,name,mimeType,webViewLink,parents`, {
      method: 'PATCH',
      body: JSON.stringify({})
    });
    return { ...asDriveFile(folder), folder_id: input.folderId, new_parent_id: input.toFolderId, live: true };
  }

  async copyFile(input: { fileId: string; toFolderId: string; newName?: string }) {
    if (!this.live) {
      const copiedId = plannedId('planned-copy');
      return {
        source_file_id: input.fileId,
        copied_file_id: copiedId,
        copied_file_planned_url: `planned-drive-file:${copiedId}`,
        target_folder_id: input.toFolderId,
        name: input.newName,
        live: false
      };
    }

    const copied = await driveFetch<DriveFileApiResponse>(`/files/${encodeURIComponent(input.fileId)}/copy?fields=id,name,mimeType,webViewLink,parents`, {
      method: 'POST',
      body: JSON.stringify({
        name: input.newName,
        parents: [input.toFolderId]
      })
    });
    return { ...asDriveFile(copied), source_file_id: input.fileId, target_folder_id: input.toFolderId, live: true };
  }
}
