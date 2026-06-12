import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

import {
  APPROVED_WRITE_OPERATOR_EMAIL,
  ALLOWED_TARGET_FOLDERS,
  driveInstallZipPackage,
  driveUnpackZipToFolder,
  driveUploadZip
} from "../src/lib/autobuilder-v2/drive-zip-runner.js";

function toDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  return { dosDate, dosTime };
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

function createZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  const { dosDate, dosTime } = toDosDateTime();

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name.replace(/\\/g, "/"));
    const raw = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(String(entry.content ?? ""), "utf8");
    const compressed = entry.method === 8 ? deflateRawSync(raw) : raw;
    const checksum = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(entry.method ?? 8, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);

    parts.push(local, nameBuffer, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(entry.method ?? 8, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(raw.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(entry.directory ? 0x10 : 0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    central.push(centralHeader, nameBuffer);
    offset += local.length + nameBuffer.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, centralDirectory, end]);
}

async function writeTempZip(entries, filename) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "auto-builder-zip-"));
  const filePath = path.join(dir, filename);
  await writeFile(filePath, createZip(entries));
  return { dir, filePath };
}

async function run() {
  const zip = await writeTempZip([{ name: "manifest.json", content: JSON.stringify({ name: "demo" }), method: 8 }], "good.zip");
  const badTraversal = await writeTempZip([{ name: "../evil.txt", content: "nope", method: 8 }], "traversal.zip");
  const badSecret = await writeTempZip([{ name: ".env.production", content: "SECRET=1", method: 8 }], "secret.zip");
  const badExec = await writeTempZip([{ name: "bin/run.ps1", content: "Write-Host nope", method: 8 }], "exec.zip");
  const badManifest = await writeTempZip([{ name: "README.md", content: "# demo", method: 8 }], "manifest.zip");

  const dryRun = await driveUploadZip({
    source_file_path: zip.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    title: "good.zip",
    mode: "dry_run",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL
  });
  assert.equal(dryRun.ok, true);
  assert.equal(dryRun.mode, "dry_run");
  assert.ok(dryRun.plan);
  assert.ok(dryRun.receiptPath);
  assert.equal(path.extname(dryRun.receiptPath), ".json");

  const deniedFolder = await driveUploadZip({
    source_file_path: zip.filePath,
    target_folder_id: "not-allowlisted",
    title: "good.zip",
    mode: "approved_write",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL
  });
  assert.equal(deniedFolder.ok, false);
  assert.ok(deniedFolder.gateErrors?.some((message) => message.includes("allowlisted")));

  const deniedOperator = await driveUploadZip({
    source_file_path: zip.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    title: "good.zip",
    mode: "approved_write",
    operator_email: "wrong@example.com"
  });
  assert.equal(deniedOperator.ok, false);
  assert.ok(deniedOperator.gateErrors?.some((message) => message.includes("operator_email")));

  const traversal = await driveUnpackZipToFolder({
    source_file_path: badTraversal.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    install_folder_name: "install",
    mode: "dry_run",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL
  });
  assert.equal(traversal.ok, false);
  assert.ok(traversal.blocked_entries.some((item) => item.reason.includes("Path traversal")));

  const secret = await driveUnpackZipToFolder({
    source_file_path: badSecret.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    install_folder_name: "install",
    mode: "dry_run",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL
  });
  assert.equal(secret.ok, false);
  assert.ok(secret.blocked_entries.some((item) => item.reason.includes("Secret files")));

  const executable = await driveUnpackZipToFolder({
    source_file_path: badExec.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    install_folder_name: "install",
    mode: "dry_run",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL
  });
  assert.equal(executable.ok, false);
  assert.ok(executable.blocked_entries.some((item) => item.reason.includes("Executable files")));

  const manifestBlocked = await driveInstallZipPackage({
    source_file_path: badManifest.filePath,
    target_folder_id: ALLOWED_TARGET_FOLDERS.EDEN_SKYE_STUDIOS_OS,
    install_folder_name: "install",
    package_type: "auto_builder_packet",
    mode: "dry_run",
    operator_email: APPROVED_WRITE_OPERATOR_EMAIL,
    unpack: false,
    validate_manifest: true
  });
  assert.equal(manifestBlocked.ok, false);
  assert.ok(manifestBlocked.manifest_missing.length > 0);

  const receiptFiles = [dryRun.receiptPath, traversal.receiptPath, secret.receiptPath, executable.receiptPath, manifestBlocked.receiptPath];
  for (const receiptPath of receiptFiles) {
    const body = await readFile(receiptPath, "utf8");
    const parsed = JSON.parse(body);
    assert.ok(parsed.tool);
    assert.ok(parsed.sha256);
  }

  await rm(zip.dir, { recursive: true, force: true });
  await rm(badTraversal.dir, { recursive: true, force: true });
  await rm(badSecret.dir, { recursive: true, force: true });
  await rm(badExec.dir, { recursive: true, force: true });
  await rm(badManifest.dir, { recursive: true, force: true });

  console.log("Drive ZIP validation passed: dry-run planning, allowlist gates, operator gate, traversal blocking, secret blocking, executable blocking, manifest validation, and receipt generation are all enforced.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
