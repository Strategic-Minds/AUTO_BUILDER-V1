export type DriveFileRef = {
  id: string;
  name: string;
  mimeType?: string;
  planned_url?: string;
  parents?: string[];
};

export type FolderTreeResult = {
  created: DriveFileRef[];
  existing: DriveFileRef[];
  folder_map: Record<string, string>;
};

export class MediaDriveClient {
  readonly rootFolderId: string;

  constructor(rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr') {
    this.rootFolderId = rootFolderId;
  }

  async createFolderTree(paths: string[], rootFolderId = this.rootFolderId): Promise<FolderTreeResult> {
    return {
      created: [],
      existing: paths.map((path, index) => ({
        id: `${rootFolderId}:planned-folder-${index}`,
        name: path,
        mimeType: 'application/vnd.google-apps.folder'
      })),
      folder_map: Object.fromEntries(paths.map((path, index) => [path, `${rootFolderId}:planned-folder-${index}`]))
    };
  }

  async uploadFile(input: { sourceFileRef: string; filename: string; mimeType: string; folderId: string }) {
    const id = `planned-upload-${Date.now()}`;
    return {
      id,
      name: input.filename,
      mimeType: input.mimeType,
      planned_url: `planned-drive-file:${id}`,
      parents: [input.folderId],
      sizeBytes: 0,
      sha256: 'planned'
    };
  }

  async downloadFile(input: { fileId: string; destinationName?: string; exportMimeType?: string }) {
    return {
      local_file_ref: `/tmp/${input.destinationName ?? input.fileId}`,
      filename: input.destinationName ?? input.fileId,
      mime_type: input.exportMimeType ?? 'application/octet-stream',
      source_drive_file_id: input.fileId
    };
  }

  async moveFile(input: { fileId: string; toFolderId: string; fromFolderId?: string }) {
    return {
      file_id: input.fileId,
      previous_parent_ids: input.fromFolderId ? [input.fromFolderId] : [],
      new_parent_id: input.toFolderId,
      planned_url: `planned-drive-file:${input.fileId}`
    };
  }

  async moveFolder(input: { folderId: string; toFolderId: string; fromFolderId?: string }) {
    return {
      folder_id: input.folderId,
      previous_parent_ids: input.fromFolderId ? [input.fromFolderId] : [],
      new_parent_id: input.toFolderId,
      planned_url: `planned-drive-folder:${input.folderId}`
    };
  }

  async copyFile(input: { fileId: string; toFolderId: string; newName?: string }) {
    const copiedId = `planned-copy-${Date.now()}`;
    return {
      source_file_id: input.fileId,
      copied_file_id: copiedId,
      copied_file_planned_url: `planned-drive-file:${copiedId}`,
      target_folder_id: input.toFolderId,
      name: input.newName
    };
  }
}
