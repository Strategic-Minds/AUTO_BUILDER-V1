export const ALLOWED_TARGET_FOLDERS: Record<string, string>;
export const APPROVED_WRITE_OPERATOR_EMAIL: string;
export const REQUIRED_MANIFEST_FILES_BY_PACKAGE_TYPE: Record<string, string[]>;
export const connectorSchemaVersion: string;

export function assertApprovedWriteGate(input: {
  mode?: string;
  operator_email?: string;
  target_folder_id?: string;
}): string[];

export function classifyZipEntries(entries: Array<{ rawName: string; name: string; isDirectory?: boolean }>, blockedExtensions?: string[]): Array<{ entry: string; reason: string }>;
export function collectInstallPlan(entries: Array<{ name: string; isDirectory?: boolean; compressionMethod?: number; compressedSize?: number; uncompressedSize?: number }>, installFolderName: string): { folders: string[]; files: Array<Record<string, unknown>> };
export function driveUploadZip(input: Record<string, unknown>): Promise<Record<string, unknown>>;
export function driveUnpackZipToFolder(input: Record<string, unknown>): Promise<Record<string, unknown>>;
export function driveInstallZipPackage(input: Record<string, unknown>): Promise<Record<string, unknown>>;
export function validateManifestFiles(entries: Array<{ name: string }>, packageType: string): string[];
