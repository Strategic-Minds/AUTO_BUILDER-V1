import { createSign } from "crypto";

import type { Step35PlacementRow } from "./placement";

type CredentialStatus = {
  ready: boolean;
  missing: string[];
  source: "service_account_json" | "split_fields" | "missing";
};

type GoogleCredentials = {
  clientEmail: string;
  privateKey: string;
};

type DriveFolder = {
  id: string;
  name: string;
};

type PlacementReceipt = {
  localPath: string;
  folderId?: string;
  fileId?: string;
  action: "uploaded" | "skipped_existing";
  statusAfterUpload: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

export function getCanonicalAssetPackageBaseUrl(): string | undefined {
  return process.env.EDEN_CANONICAL_ASSET_PACKAGE_BASE_URL ?? process.env.STEP35_PACKAGE_BASE_URL;
}

export function getHostedCredentialStatus(): CredentialStatus {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      return { ready: true, missing: [], source: "service_account_json" };
    } catch {
      return { ready: false, missing: ["valid_GOOGLE_SERVICE_ACCOUNT_JSON"], source: "missing" };
    }
  }

  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_EMAIL) missing.push("GOOGLE_CLIENT_EMAIL");
  if (!process.env.GOOGLE_PRIVATE_KEY) missing.push("GOOGLE_PRIVATE_KEY");
  return { ready: missing.length === 0, missing, source: missing.length === 0 ? "split_fields" : "missing" };
}

export async function runHostedDrivePlacement(input: {
  rows: Step35PlacementRow[];
  artifactBaseUrl: string;
}): Promise<{ receipts: PlacementReceipt[]; mutationPerformed: boolean }> {
  const credentialStatus = getHostedCredentialStatus();
  if (!credentialStatus.ready) {
    throw new Error(`Missing Google credential fields: ${credentialStatus.missing.join(", ")}`);
  }

  const credentials = getGoogleCredentials();
  const token = await getAccessToken(credentials);

  const receipts: PlacementReceipt[] = [];
  for (const row of input.rows) {
    const folder = await getOrCreateFolder(token, row.driveParentFolderId, row.recommendedDriveSubfolder);
    const existing = await findFile(token, folder.id, basename(row.localPath));
    if (existing) {
      receipts.push({
        localPath: row.localPath,
        folderId: folder.id,
        fileId: existing.id,
        action: "skipped_existing",
        statusAfterUpload: row.statusAfterUpload,
      });
      continue;
    }

    const assetResponse = await fetch(assetUrl(input.artifactBaseUrl, row.localPath));
    if (!assetResponse.ok) {
      throw new Error(`Artifact fetch failed for ${row.localPath}: ${assetResponse.status}`);
    }

    const bytes = Buffer.from(await assetResponse.arrayBuffer());
    const uploaded = await uploadFile(token, folder.id, basename(row.localPath), bytes, contentTypeFor(row.localPath));
    receipts.push({
      localPath: row.localPath,
      folderId: folder.id,
      fileId: uploaded.id,
      action: "uploaded",
      statusAfterUpload: row.statusAfterUpload,
    });
  }

  return {
    receipts,
    mutationPerformed: receipts.some((receipt) => receipt.action === "uploaded"),
  };
}

function getGoogleCredentials(): GoogleCredentials {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  return {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL ?? "",
    privateKey: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY ?? ""),
  };
}

function parseServiceAccountJson(rawValue: string): GoogleCredentials {
  const parsed = JSON.parse(rawValue) as { client_email?: unknown; private_key?: unknown };
  if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key strings.");
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: normalizePrivateKey(parsed.private_key),
  };
}

async function getAccessToken(input: GoogleCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertionHeader = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const assertionPayload = base64Url(
    JSON.stringify({
      iss: input.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    })
  );
  const unsigned = `${assertionHeader}.${assertionPayload}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(input.privateKey);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const body = (await response.json()) as { access_token?: string; error_description?: string; error?: string };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description ?? body.error ?? `Google token request failed: ${response.status}`);
  }

  return body.access_token;
}

async function getOrCreateFolder(token: string, parentId: string, name: string): Promise<DriveFolder> {
  const existing = await findFolder(token, parentId, name);
  if (existing) return existing;

  const response = await driveFetch(`${DRIVE_API}/files?fields=id,name`, token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  return (await response.json()) as DriveFolder;
}

async function findFolder(token: string, parentId: string, name: string): Promise<DriveFolder | null> {
  const query = `'${escapeQuery(parentId)}' in parents and name = '${escapeQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`;
  const response = await driveFetch(url, token);
  const body = (await response.json()) as { files?: DriveFolder[] };
  return body.files?.[0] ?? null;
}

async function findFile(token: string, parentId: string, name: string): Promise<DriveFolder | null> {
  const query = `'${escapeQuery(parentId)}' in parents and name = '${escapeQuery(name)}' and trashed = false`;
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`;
  const response = await driveFetch(url, token);
  const body = (await response.json()) as { files?: DriveFolder[] };
  return body.files?.[0] ?? null;
}

async function uploadFile(
  token: string,
  parentId: string,
  name: string,
  bytes: Buffer,
  mimeType: string
): Promise<DriveFolder> {
  const metadata = { name, parents: [parentId] };
  const boundary = `eden_canonical_asset_${Date.now().toString(36)}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\ncontent-type: ${mimeType}\r\n\r\n`),
    bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const response = await driveFetch(`${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name`, token, {
    method: "POST",
    headers: { "content-type": `multipart/related; boundary=${boundary}` },
    body,
  });
  return (await response.json()) as DriveFolder;
}

async function driveFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Drive request failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return response;
}

function assetUrl(baseUrl: string, localPath: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(localPath.split("/").map(encodeURIComponent).join("/"), normalizedBase).toString();
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizePrivateKey(value: string): string {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function escapeQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function contentTypeFor(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".csv")) return "text/csv";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "application/yaml";
  if (path.endsWith(".sql")) return "application/sql";
  return "text/markdown";
}
