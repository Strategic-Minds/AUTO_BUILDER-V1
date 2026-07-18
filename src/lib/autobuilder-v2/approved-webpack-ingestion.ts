import { createHash, createSign } from "node:crypto";
import { inflateRawSync } from "node:zlib";

export const APPROVED_WEBPACK = {
  jobId: "AZ-EPOXY-WEBPACK-20260718-01",
  projectName: "Arizona Epoxy Pros",
  assetLabel: "ARIZONA_EPOXY_PROS_APPROVED_WEBPACK_2026-07-18",
  expectedSha256: "63c678127e2382f7985c2f6b71bbe2c7a9e2b7855168c926577d53e2e0189e00",
  expectedWidth: 935,
  expectedHeight: 1683,
  mimeType: "image/png",
  carrierDriveFileId: "1Jpkb0TC1a88K_JymxMs8dRNB1m3aE_3zplls7jPTs1M",
  repository: "Strategic-Minds/AUTO_BUILDER-V1",
  branch: "auto-builder/image-ingestion-repair-20260718",
  assetPath: "runtime/source-truth/AZ-EPOXY-WEBPACK-20260718-01/approved-web-pack.png",
  manifestPath: "runtime/source-truth/AZ-EPOXY-WEBPACK-20260718-01/manifest.json",
  queuePath: "runtime/queues/five-minute/AZ-EPOXY-WEBPACK-20260718-01.json",
} as const;

type GithubWriteResult = {
  path: string;
  sha: string | null;
  commitSha: string | null;
  unchanged: boolean;
};

export type ApprovedWebpackIngestionResult = {
  ok: boolean;
  jobId: string;
  source: {
    carrierDriveFileId: string;
    imageEntry: string;
    sha256: string;
    width: number;
    height: number;
    byteSize: number;
  };
  repository: string;
  branch: string;
  writes: GithubWriteResult[];
  queueManifest: Record<string, unknown>;
};

export async function ingestApprovedWebpack(): Promise<ApprovedWebpackIngestionResult> {
  assertPreviewOnly();

  const pptx = await exportDrivePresentation(APPROVED_WEBPACK.carrierDriveFileId);
  const extracted = findMatchingPng(pptx, APPROVED_WEBPACK.expectedSha256);
  const dimensions = readPngDimensions(extracted.bytes);

  if (dimensions.width !== APPROVED_WEBPACK.expectedWidth || dimensions.height !== APPROVED_WEBPACK.expectedHeight) {
    throw new Error(
      `Approved image dimensions changed. Expected ${APPROVED_WEBPACK.expectedWidth}x${APPROVED_WEBPACK.expectedHeight}; received ${dimensions.width}x${dimensions.height}.`,
    );
  }

  const manifest = {
    schemaVersion: "1.0",
    jobId: APPROVED_WEBPACK.jobId,
    projectName: APPROVED_WEBPACK.projectName,
    assetLabel: APPROVED_WEBPACK.assetLabel,
    approvalState: "operator_approved",
    sourceType: "google_slides_binary_carrier",
    carrierDriveFileId: APPROVED_WEBPACK.carrierDriveFileId,
    assetPath: APPROVED_WEBPACK.assetPath,
    sha256: APPROVED_WEBPACK.expectedSha256,
    mimeType: APPROVED_WEBPACK.mimeType,
    width: dimensions.width,
    height: dimensions.height,
    byteSize: extracted.bytes.byteLength,
    previewOnly: true,
    productionAllowed: false,
    legacyBrowserWorkerMutable: false,
    approvedBy: "Jeremy",
    approvalPhrase: "PUT THIS IN THE PIPELINE",
  };

  const queueManifest = {
    schemaVersion: "1.0",
    jobId: APPROVED_WEBPACK.jobId,
    idempotencyKey: APPROVED_WEBPACK.jobId,
    queue: "vercel-workflow-five-minute",
    state: "queued",
    projectName: APPROVED_WEBPACK.projectName,
    sourceManifestPath: APPROVED_WEBPACK.manifestPath,
    approvedAssetPath: APPROVED_WEBPACK.assetPath,
    approvedAssetSha256: APPROVED_WEBPACK.expectedSha256,
    targetBranch: APPROVED_WEBPACK.branch,
    deploymentMode: "preview",
    maxRepairAttempts: 5,
    visualParityTarget: 99,
    operationalParityTarget: 100,
    blockedActions: [
      "production_deploy",
      "production_domain_change",
      "legacy_browserworker_change",
      "secret_change",
      "payment_or_spend",
      "customer_message",
      "destructive_action",
    ],
  };

  const writes = await writeGithubFiles([
    {
      path: APPROVED_WEBPACK.assetPath,
      bytes: extracted.bytes,
      message: `chore(pipeline): ingest approved web pack for ${APPROVED_WEBPACK.jobId}`,
    },
    {
      path: APPROVED_WEBPACK.manifestPath,
      bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
      message: `chore(pipeline): register approved asset manifest for ${APPROVED_WEBPACK.jobId}`,
    },
    {
      path: APPROVED_WEBPACK.queuePath,
      bytes: Buffer.from(`${JSON.stringify(queueManifest, null, 2)}\n`, "utf8"),
      message: `chore(pipeline): enqueue existing job ${APPROVED_WEBPACK.jobId}`,
    },
  ]);

  return {
    ok: true,
    jobId: APPROVED_WEBPACK.jobId,
    source: {
      carrierDriveFileId: APPROVED_WEBPACK.carrierDriveFileId,
      imageEntry: extracted.name,
      sha256: APPROVED_WEBPACK.expectedSha256,
      width: dimensions.width,
      height: dimensions.height,
      byteSize: extracted.bytes.byteLength,
    },
    repository: APPROVED_WEBPACK.repository,
    branch: APPROVED_WEBPACK.branch,
    writes,
    queueManifest,
  };
}

function assertPreviewOnly() {
  const environment = process.env.VERCEL_ENV;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;

  if (environment && environment !== "preview" && environment !== "development") {
    throw new Error(`Approved web-pack ingestion is preview-only. VERCEL_ENV=${environment}.`);
  }

  if (ref && ref !== APPROVED_WEBPACK.branch) {
    throw new Error(`Approved web-pack ingestion is branch-locked to ${APPROVED_WEBPACK.branch}; received ${ref}.`);
  }
}

async function exportDrivePresentation(fileId: string): Promise<Buffer> {
  const accessToken = await getGoogleAccessToken();
  const mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export`);
  url.searchParams.set("mimeType", mimeType);

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Drive carrier export failed (${response.status}): ${body.slice(0, 500)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function getGoogleAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are required for approved asset ingestion.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(privateKey).toString("base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(`Google service-account token exchange failed (${response.status}): ${data.error_description ?? "missing access token"}`);
  }
  return data.access_token;
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function findMatchingPng(zip: Buffer, expectedSha256: string): { name: string; bytes: Buffer } {
  const entries = readZipCentralDirectory(zip);
  for (const entry of entries) {
    if (!/^ppt\/media\/.*\.png$/i.test(entry.name)) continue;
    const bytes = extractZipEntry(zip, entry);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash === expectedSha256) return { name: entry.name, bytes };
  }
  throw new Error(`No PNG in the Drive carrier matched approved SHA-256 ${expectedSha256}.`);
}

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

function readZipCentralDirectory(zip: Buffer): ZipEntry[] {
  const eocdSignature = 0x06054b50;
  const minOffset = Math.max(0, zip.length - 65_557);
  let eocd = -1;
  for (let offset = zip.length - 22; offset >= minOffset; offset -= 1) {
    if (zip.readUInt32LE(offset) === eocdSignature) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("Drive carrier is not a valid ZIP/PPTX file: EOCD not found.");

  const entryCount = zip.readUInt16LE(eocd + 10);
  let cursor = zip.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (zip.readUInt32LE(cursor) !== 0x02014b50) throw new Error(`Invalid central-directory entry at ${cursor}.`);
    const compression = zip.readUInt16LE(cursor + 10);
    const compressedSize = zip.readUInt32LE(cursor + 20);
    const uncompressedSize = zip.readUInt32LE(cursor + 24);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const localHeaderOffset = zip.readUInt32LE(cursor + 42);
    const name = zip.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    entries.push({ name, compression, compressedSize, uncompressedSize, localHeaderOffset });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function extractZipEntry(zip: Buffer, entry: ZipEntry): Buffer {
  const offset = entry.localHeaderOffset;
  if (zip.readUInt32LE(offset) !== 0x04034b50) throw new Error(`Invalid local ZIP header for ${entry.name}.`);
  const nameLength = zip.readUInt16LE(offset + 26);
  const extraLength = zip.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const compressed = zip.subarray(start, start + entry.compressedSize);

  let result: Buffer;
  if (entry.compression === 0) result = Buffer.from(compressed);
  else if (entry.compression === 8) result = inflateRawSync(compressed);
  else throw new Error(`Unsupported ZIP compression method ${entry.compression} for ${entry.name}.`);

  if (result.byteLength !== entry.uncompressedSize) {
    throw new Error(`ZIP size mismatch for ${entry.name}: expected ${entry.uncompressedSize}, received ${result.byteLength}.`);
  }
  return result;
}

function readPngDimensions(bytes: Buffer) {
  const signature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== signature || bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error("Approved asset is not a valid PNG with an IHDR header.");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function writeGithubFiles(
  files: Array<{ path: string; bytes: Buffer; message: string }>,
): Promise<GithubWriteResult[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required for branch-scoped approved asset ingestion.");

  const results: GithubWriteResult[] = [];
  for (const file of files) results.push(await putGithubFile(token, file.path, file.bytes, file.message));
  return results;
}

async function putGithubFile(token: string, path: string, bytes: Buffer, message: string): Promise<GithubWriteResult> {
  const [owner, repo] = APPROVED_WEBPACK.repository.split("/");
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "strategic-minds-auto-builder",
  };

  const existingResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(APPROVED_WEBPACK.branch)}`, {
    headers,
    cache: "no-store",
  });
  const existing = existingResponse.ok
    ? ((await existingResponse.json()) as { sha?: string; download_url?: string })
    : null;

  if (existing?.download_url) {
    const current = await fetch(existing.download_url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (current.ok) {
      const currentBytes = Buffer.from(await current.arrayBuffer());
      if (createHash("sha256").update(currentBytes).digest("hex") === createHash("sha256").update(bytes).digest("hex")) {
        return { path, sha: existing.sha ?? null, commitSha: null, unchanged: true };
      }
    }
  }

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      message,
      content: bytes.toString("base64"),
      branch: APPROVED_WEBPACK.branch,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
    cache: "no-store",
  });
  const text = await response.text();
  const data = parseJson(text) as { content?: { sha?: string }; commit?: { sha?: string } };
  if (!response.ok) throw new Error(`GitHub write failed for ${path} (${response.status}): ${text.slice(0, 500)}`);

  return {
    path,
    sha: data.content?.sha ?? null,
    commitSha: data.commit?.sha ?? null,
    unchanged: false,
  };
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { raw: value };
  }
}
