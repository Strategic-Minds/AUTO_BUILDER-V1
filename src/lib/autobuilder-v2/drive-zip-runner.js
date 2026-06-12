import { createHash, createSign } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { deflateRawSync, inflateRawSync } from "node:zlib";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const APPROVED_WRITE_OPERATOR_EMAIL = "strategicmindsadvisory@gmail.com";
const ALLOWED_TARGET_FOLDERS = {
  EDEN_SKYE_STUDIOS_OS: "1oCEjD6kUm9FiYDh1w-dNE9PPiggj65MQ",
  "V2 MASTER AUTO BUILDER": "13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr"
};
const SECRET_NAME_PATTERNS = [
  /^\.env(?:\..+)?$/i,
  /^.*\.pem$/i,
  /^.*\.key$/i,
  /^.*\.p12$/i,
  /^.*\.pfx$/i,
  /^credentials.*\.json$/i,
  /^service-account.*\.json$/i
];
const BLOCKED_EXECUTABLE_PATTERNS = [/^.*\.exe$/i, /^.*\.dll$/i, /^.*\.bat$/i, /^.*\.cmd$/i, /^.*\.ps1$/i, /^.*\.sh$/i];
const REQUIRED_MANIFEST_FILES_BY_PACKAGE_TYPE = {
  eden_shopify_generator_docs: ["manifest.json", "README.md"],
  eden_visual_source_truth: ["manifest.json", "source-truth.json"],
  auto_builder_packet: ["manifest.json", "packet.json"],
  general: []
};

function normalizePrivateKey(value) {
  return value.replace(/\\n/g, "\n");
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload, privateKey) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  return `${header}.${body}.${signer.sign(normalizePrivateKey(privateKey)).toString("base64url")}`;
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    return { ok: false, error: "GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY must be configured." };
  }

  const now = Math.floor(Date.now() / 1000);
  const scope = process.env.GOOGLE_DRIVE_SCOPE ?? DRIVE_SCOPE;
  const assertion = signJwt(
    {
      iss: clientEmail,
      scope,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600
    },
    privateKey
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") {
    return { ok: false, error: "Google OAuth token exchange failed.", status: response.status };
  }

  return { ok: true, accessToken: data.access_token, scope };
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function isAllowedTargetFolder(targetFolderId) {
  return Object.values(ALLOWED_TARGET_FOLDERS).includes(targetFolderId);
}

function assertApprovedWriteGate(input) {
  const errors = [];
  if (input.mode !== "approved_write") errors.push("mode must equal approved_write");
  if (input.operator_email !== APPROVED_WRITE_OPERATOR_EMAIL) errors.push("operator_email must equal strategicmindsadvisory@gmail.com");
  if (!isAllowedTargetFolder(input.target_folder_id)) errors.push("target_folder_id must be allowlisted");
  return errors;
}

function isAbsoluteZipPath(name) {
  return /^([A-Za-z]:[\\/]|[\\/])/u.test(name);
}

function isPathTraversal(name) {
  const normalized = name.replace(/\\/g, "/");
  return normalized.split("/").some((part) => part === "..");
}

function isSecretName(name) {
  const base = path.posix.basename(name.replace(/\\/g, "/"));
  return SECRET_NAME_PATTERNS.some((pattern) => pattern.test(base));
}

function isBlockedExecutable(name, blockedExtensions = []) {
  const base = path.posix.basename(name.replace(/\\/g, "/"));
  const ext = path.posix.extname(base).toLowerCase();
  return BLOCKED_EXECUTABLE_PATTERNS.some((pattern) => pattern.test(base)) || blockedExtensions.map((item) => item.toLowerCase()).includes(ext);
}

function normalizeZipEntryName(name) {
  return name.replace(/\\/g, "/").replace(/^\/+/, "");
}

function readUInt16LE(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readUInt32LE(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function findEndOfCentralDirectory(buffer) {
  const minimumSize = 22;
  const maxComment = 0xffff;
  const start = Math.max(0, buffer.length - minimumSize - maxComment);
  for (let offset = buffer.length - minimumSize; offset >= start; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return { offset, entries: readUInt16LE(buffer, offset + 10), size: readUInt32LE(buffer, offset + 12), centralDirectoryOffset: readUInt32LE(buffer, offset + 16) };
    }
  }
  throw new Error("Zip end-of-central-directory record not found.");
}

function parseZipEntries(buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  const entries = [];
  let cursor = eocd.centralDirectoryOffset;
  for (let index = 0; index < eocd.entries; index += 1) {
    const signature = readUInt32LE(buffer, cursor);
    if (signature !== 0x02014b50) throw new Error(`Invalid central directory signature at offset ${cursor}.`);
    const flags = readUInt16LE(buffer, cursor + 8);
    const compressionMethod = readUInt16LE(buffer, cursor + 10);
    const compressedSize = readUInt32LE(buffer, cursor + 20);
    const uncompressedSize = readUInt32LE(buffer, cursor + 24);
    const fileNameLength = readUInt16LE(buffer, cursor + 28);
    const extraFieldLength = readUInt16LE(buffer, cursor + 30);
    const fileCommentLength = readUInt16LE(buffer, cursor + 32);
    const localHeaderOffset = readUInt32LE(buffer, cursor + 42);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + fileNameLength;
    const rawName = buffer.slice(nameStart, nameEnd).toString("utf8");
    const name = normalizeZipEntryName(rawName);
    entries.push({
      rawName,
      name,
      flags,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      isDirectory: name.endsWith("/")
    });
    cursor = nameEnd + extraFieldLength + fileCommentLength;
  }
  return entries;
}

function extractZipEntryData(buffer, entry) {
  const offset = entry.localHeaderOffset;
  if (readUInt32LE(buffer, offset) !== 0x04034b50) {
    throw new Error(`Invalid local file header for ${entry.rawName}`);
  }
  const fileNameLength = readUInt16LE(buffer, offset + 26);
  const extraFieldLength = readUInt16LE(buffer, offset + 28);
  const dataStart = offset + 30 + fileNameLength + extraFieldLength;
  const dataEnd = dataStart + entry.compressedSize;
  const compressed = buffer.slice(dataStart, dataEnd);
  if (entry.compressionMethod === 0) return compressed;
  if (entry.compressionMethod === 8) return inflateRawSync(compressed);
  throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod} for ${entry.rawName}`);
}

async function readZipFile(sourceFilePath) {
  const stat = await fs.stat(sourceFilePath);
  if (!stat.isFile()) throw new Error(`Source file not found: ${sourceFilePath}`);
  if (!sourceFilePath.toLowerCase().endsWith(".zip")) throw new Error("Source file must end with .zip");
  const buffer = await fs.readFile(sourceFilePath);
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new Error("ZIP signature not found at the start of the file.");
  }
  const entries = parseZipEntries(buffer);
  return { buffer, entries, sha256: sha256(buffer), mimeType: "application/zip", bytes: buffer.length };
}

function classifyZipEntries(entries, blockedExtensions = []) {
  const problems = [];
  for (const entry of entries) {
    if (!entry.rawName || entry.rawName.trim().length === 0) {
      problems.push({ entry: entry.rawName || "<empty>", reason: "Empty ZIP entry name." });
      continue;
    }
    if (isAbsoluteZipPath(entry.rawName)) problems.push({ entry: entry.rawName, reason: "Absolute ZIP paths are blocked." });
    if (isPathTraversal(entry.rawName)) problems.push({ entry: entry.rawName, reason: "Path traversal is blocked." });
    if (isSecretName(entry.rawName)) problems.push({ entry: entry.rawName, reason: "Secret files are blocked." });
    if (isBlockedExecutable(entry.rawName, blockedExtensions)) problems.push({ entry: entry.rawName, reason: "Executable files are blocked by default." });
  }
  return problems;
}

function collectInstallPlan(entries, installFolderName) {
  const folders = new Set([installFolderName]);
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory) {
      folders.add(path.posix.join(installFolderName, entry.name.replace(/\/+$/, "")));
      continue;
    }
    const fullPath = path.posix.join(installFolderName, entry.name);
    const folderPath = path.posix.dirname(fullPath);
    if (folderPath && folderPath !== ".") folders.add(folderPath);
    files.push({ path: fullPath, name: path.posix.basename(entry.name), compressionMethod: entry.compressionMethod, compressedSize: entry.compressedSize, uncompressedSize: entry.uncompressedSize });
  }
  return { folders: [...folders], files };
}

function validateManifestFiles(entries, packageType) {
  const requiredFiles = REQUIRED_MANIFEST_FILES_BY_PACKAGE_TYPE[packageType] ?? [];
  if (!requiredFiles.length) return [];
  const names = new Set(entries.map((entry) => entry.name.replace(/\/+$/, "")));
  const missing = requiredFiles.filter((fileName) => !names.has(fileName));
  return missing;
}

function buildReceiptPath(prefix) {
  return path.posix.join("data/factory/receipts", `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
}

async function writeReceiptFile(receipt, receiptPath) {
  const resolved = receiptPath ?? buildReceiptPath(receipt.kind);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, JSON.stringify(receipt, null, 2));
  return resolved;
}

async function createDriveFolder(accessToken, name, parentFolderId) {
  const response = await fetch(`${DRIVE_API}/files?supportsAllDrives=true&fields=id,name,mimeType,webViewLink,parents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      mimeType: DRIVE_FOLDER_MIME,
      parents: [parentFolderId]
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Google Drive folder creation failed: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

async function uploadDriveMedia(accessToken, name, parentFolderId, mimeType, body) {
  const boundary = `drive_media_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const metadata = JSON.stringify({ name, parents: [parentFolderId] });
  const multipart = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    Buffer.isBuffer(body) ? body : Buffer.from(body),
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);
  const response = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,webViewLink,parents,size`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipart
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Google Drive media upload failed: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

async function uploadDriveZipFile(accessToken, title, parentFolderId, zipBuffer) {
  const metadata = {
    name: title,
    parents: [parentFolderId]
  };
  const boundary = `zip_upload_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const multipart = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/zip\r\n\r\n`),
    zipBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);
  const response = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,webViewLink,parents,size`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipart
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Google Drive ZIP upload failed: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

const driveUploadZipFile = uploadDriveZipFile;

async function ensureInstallFolder(accessToken, targetFolderId, installFolderName) {
  return createDriveFolder(accessToken, installFolderName, targetFolderId);
}

async function ensurePathFolders(accessToken, targetFolderId, folderPath, cache) {
  const normalized = folderPath.split("/").filter(Boolean);
  let parentFolderId = targetFolderId;
  let currentPath = "";
  for (const segment of normalized) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    const cached = cache.get(currentPath);
    if (cached) {
      parentFolderId = cached;
      continue;
    }
    const created = await createDriveFolder(accessToken, segment, parentFolderId);
    cache.set(currentPath, created.id);
    parentFolderId = created.id;
  }
  return parentFolderId;
}

export async function driveUploadZip(input) {
  const zip = await readZipFile(input.source_file_path);
  const gateErrors = input.mode === "approved_write" ? assertApprovedWriteGate(input) : [];
  const receipt = {
    kind: "drive-zip-upload",
    tool: "drive_upload_zip",
    source_file_path: input.source_file_path,
    target_folder_id: input.target_folder_id,
    title: input.title,
    mode: input.mode ?? "dry_run",
    operator_email: input.operator_email,
    allowlisted: isAllowedTargetFolder(input.target_folder_id),
    sha256: zip.sha256,
    bytes: zip.bytes,
    mime_type: zip.mimeType,
    entries: zip.entries.map((entry) => entry.name),
    validation: gateErrors.length ? "blocked" : "ready"
  };
  const receiptPath = await writeReceiptFile(receipt, input.receipt_path ?? buildReceiptPath("drive-zip-upload"));

  if (input.mode !== "approved_write") {
    return {
      ok: gateErrors.length === 0,
      mode: "dry_run",
      receiptPath,
      plan: {
        action: "upload_zip",
        target_folder_id: input.target_folder_id,
        title: input.title,
        sha256: zip.sha256,
        bytes: zip.bytes,
        mime_type: zip.mimeType,
        entries: zip.entries.map((entry) => entry.name),
        approved_write_required: true
      },
      gateErrors
    };
  }

  if (gateErrors.length) {
    return { ok: false, mode: "approved_write", receiptPath, gateErrors };
  }

  const accessTokenResult = await getGoogleAccessToken();
  if (!accessTokenResult.ok) {
    return { ok: false, mode: "approved_write", receiptPath, error: accessTokenResult.error };
  }

  const uploaded = await uploadDriveZipFile(accessTokenResult.accessToken, input.title, input.target_folder_id, zip.buffer);
  return {
    ok: true,
    mode: "approved_write",
    receiptPath,
    uploadedFile: uploaded,
    sha256: zip.sha256,
    bytes: zip.bytes,
    entries: zip.entries.map((entry) => entry.name)
  };
}

export async function driveUnpackZipToFolder(input) {
  const zip = await readZipFile(input.source_file_path);
  const blockedExtensions = Array.isArray(input.blocked_extensions) ? input.blocked_extensions : [];
  const entryProblems = classifyZipEntries(zip.entries, blockedExtensions);
  const gateErrors = input.mode === "approved_write" ? assertApprovedWriteGate(input) : [];
  const installPlan = collectInstallPlan(zip.entries, input.install_folder_name);
  const receipt = {
    kind: "drive-zip-unpack",
    tool: "drive_unpack_zip_to_folder",
    source_file_path: input.source_file_path,
    target_folder_id: input.target_folder_id,
    install_folder_name: input.install_folder_name,
    mode: input.mode ?? "dry_run",
    operator_email: input.operator_email,
    allowlisted: isAllowedTargetFolder(input.target_folder_id),
    sha256: zip.sha256,
    bytes: zip.bytes,
    mime_type: zip.mimeType,
    entry_count: zip.entries.length,
    blocked_entries: entryProblems,
    validation: gateErrors.length || entryProblems.length ? "blocked" : "ready"
  };
  const receiptPath = await writeReceiptFile(receipt, input.receipt_path ?? buildReceiptPath("drive-zip-unpack"));

  if (input.mode !== "approved_write") {
    return {
      ok: gateErrors.length === 0 && entryProblems.length === 0,
      mode: "dry_run",
      receiptPath,
      plan: installPlan,
      blocked_entries: entryProblems,
      gateErrors
    };
  }

  if (gateErrors.length || entryProblems.length) {
    return { ok: false, mode: "approved_write", receiptPath, gateErrors, blocked_entries: entryProblems };
  }

  const accessTokenResult = await getGoogleAccessToken();
  if (!accessTokenResult.ok) {
    return { ok: false, mode: "approved_write", receiptPath, error: accessTokenResult.error };
  }

  const folderCache = new Map();
  const installFolder = await ensureInstallFolder(accessTokenResult.accessToken, input.target_folder_id, input.install_folder_name);
  const uploadedFiles = [];

  for (const entry of zip.entries) {
    if (entry.isDirectory) continue;
    const fileContent = extractZipEntryData(zip.buffer, entry);
    const fullPath = normalizeZipEntryName(path.posix.join(input.install_folder_name, entry.name));
    const parentPath = path.posix.dirname(fullPath);
    let parentFolderId = installFolder.id;
    if (parentPath && parentPath !== "." && parentPath !== input.install_folder_name) {
      const relativePath = parentPath.replace(new RegExp(`^${input.install_folder_name}/?`), "");
      parentFolderId = relativePath ? await ensurePathFolders(accessTokenResult.accessToken, installFolder.id, relativePath, folderCache) : installFolder.id;
    }
    const uploaded = await uploadDriveMedia(
      accessTokenResult.accessToken,
      path.posix.basename(entry.name),
      parentFolderId,
      "application/octet-stream",
      fileContent
    );
    uploadedFiles.push({ path: fullPath, file: uploaded });
  }

  return {
    ok: true,
    mode: "approved_write",
    receiptPath,
    installFolder,
    uploadedFiles,
    plan: installPlan,
    sha256: zip.sha256,
    bytes: zip.bytes
  };
}

export async function driveInstallZipPackage(input) {
  const zip = await readZipFile(input.source_file_path);
  const validateManifest = input.validate_manifest === true;
  const blockedExtensions = Array.isArray(input.blocked_extensions) ? input.blocked_extensions : [];
  const entryProblems = classifyZipEntries(zip.entries, blockedExtensions);
  const manifestMissing = validateManifest ? validateManifestFiles(zip.entries, input.package_type) : [];
  const gateErrors = input.mode === "approved_write" ? assertApprovedWriteGate(input) : [];
  const plan = collectInstallPlan(zip.entries, input.install_folder_name);
  const receipt = {
    kind: "drive-zip-install",
    tool: "drive_install_zip_package",
    source_file_path: input.source_file_path,
    target_folder_id: input.target_folder_id,
    install_folder_name: input.install_folder_name,
    package_type: input.package_type,
    mode: input.mode ?? "dry_run",
    operator_email: input.operator_email,
    unpack: Boolean(input.unpack),
    validate_manifest: validateManifest,
    sha256: zip.sha256,
    bytes: zip.bytes,
    mime_type: zip.mimeType,
    validation: gateErrors.length || entryProblems.length || manifestMissing.length ? "blocked" : "ready",
    blocked_entries: entryProblems,
    manifest_missing: manifestMissing
  };
  const receiptPath = await writeReceiptFile(receipt, input.receipt_path ?? buildReceiptPath("drive-zip-install"));

  if (input.mode !== "approved_write") {
    return {
      ok: gateErrors.length === 0 && entryProblems.length === 0 && manifestMissing.length === 0,
      mode: "dry_run",
      receiptPath,
      plan,
      blocked_entries: entryProblems,
      manifest_missing: manifestMissing,
      gateErrors
    };
  }

  if (gateErrors.length || entryProblems.length || manifestMissing.length) {
    return { ok: false, mode: "approved_write", receiptPath, gateErrors, blocked_entries: entryProblems, manifest_missing: manifestMissing };
  }

  const accessTokenResult = await getGoogleAccessToken();
  if (!accessTokenResult.ok) {
    return { ok: false, mode: "approved_write", receiptPath, error: accessTokenResult.error };
  }

  const uploadedZip = await uploadDriveZipFile(accessTokenResult.accessToken, path.basename(input.source_file_path), input.target_folder_id, zip.buffer);
  const result = { ok: true, mode: "approved_write", receiptPath, uploadedZip, sha256: zip.sha256, bytes: zip.bytes };

  if (!input.unpack) return result;

  const unpacked = await driveUnpackZipToFolder({ ...input, mode: "approved_write", receipt_path: receiptPath });
  return { ...result, unpacked };
}

export {
  ALLOWED_TARGET_FOLDERS,
  APPROVED_WRITE_OPERATOR_EMAIL,
  REQUIRED_MANIFEST_FILES_BY_PACKAGE_TYPE,
  assertApprovedWriteGate,
  classifyZipEntries,
  collectInstallPlan,
  driveUploadZipFile,
  extractZipEntryData,
  getGoogleAccessToken,
  isAllowedTargetFolder,
  readZipFile,
  validateManifestFiles,
  writeReceiptFile,
  uploadDriveZipFile,
  uploadDriveMedia
};
