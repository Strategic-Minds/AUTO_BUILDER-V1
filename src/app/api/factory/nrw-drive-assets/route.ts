export const runtime = "nodejs";
export const maxDuration = 300;

const CONFIRM = "copy-nrw-assets-20260604";
const TARGET_FOLDER_ID = "1ELQQUs4xGZjPnDYiq0_rWYP9mvt_qtAZ";

const approvedAssets = [
  {
    sourceFileId: "1TIxz4t2mu_NFgZvYMLKJ0uZ6WY3N3lp9",
    filename: "nashville-resin-worx-primary-logo.png",
    label: "Nashville Resin Worx primary logo"
  },
  {
    sourceFileId: "1OKaxgtblK32U8Ffc16wPKlIDnlW_Eokl",
    filename: "nashville-resin-worx-brand-pack-board.png",
    label: "Nashville Resin Worx brand pack board"
  }
];

type JsonLike = Record<string, unknown> | string | null;

function parseJsonIfPossible(text: string): JsonLike {
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return text;
  }
}

function getGoogleDriveToken() {
  return process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN;
}

function escapeDriveQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function driveJson(token: string, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });
  return { ok: response.ok, statusCode: response.status, body: parseJsonIfPossible(await response.text()) };
}

async function findExistingByName(token: string, folderId: string, filename: string) {
  const q = `'${escapeDriveQuery(folderId)}' in parents and name = '${escapeDriveQuery(filename)}' and trashed = false`;
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id,name,mimeType,webViewLink,parents)");
  url.searchParams.set("pageSize", "10");
  const result = await driveJson(token, url.toString());
  if (!result.ok || !result.body || typeof result.body === "string") return null;
  const files = Array.isArray(result.body.files) ? result.body.files : [];
  return files[0] ?? null;
}

async function uploadBytesToFolder(params: { token: string; folderId: string; filename: string; mimeType: string; bytes: Uint8Array }) {
  const boundary = `auto-builder-${crypto.randomUUID()}`;
  const metadata = { name: params.filename, mimeType: params.mimeType, parents: [params.folderId] };
  const base64Content = Buffer.from(params.bytes).toString("base64");
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${params.mimeType}`,
    "Content-Transfer-Encoding: base64",
    "",
    base64Content,
    `--${boundary}--`,
    ""
  ].join("\r\n");

  return driveJson(
    params.token,
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,parents",
    { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body }
  );
}

async function copyAsset(token: string, asset: (typeof approvedAssets)[number]) {
  const existing = await findExistingByName(token, TARGET_FOLDER_ID, asset.filename);
  if (existing) {
    return { ...asset, status: "exists", copied: false, target: existing };
  }

  const metadataResult = await driveJson(
    token,
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(asset.sourceFileId)}?fields=id,name,mimeType,size,webViewLink`
  );
  if (!metadataResult.ok || !metadataResult.body || typeof metadataResult.body === "string") {
    return { ...asset, status: "metadata_error", copied: false, receipt: metadataResult };
  }

  const mediaResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(asset.sourceFileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!mediaResponse.ok) {
    return { ...asset, status: "media_error", copied: false, statusCode: mediaResponse.status, receipt: parseJsonIfPossible(await mediaResponse.text()) };
  }

  const bytes = new Uint8Array(await mediaResponse.arrayBuffer());
  const mimeType = typeof metadataResult.body.mimeType === "string" ? metadataResult.body.mimeType : "application/octet-stream";
  const uploadResult = await uploadBytesToFolder({ token, folderId: TARGET_FOLDER_ID, filename: asset.filename, mimeType, bytes });
  return { ...asset, status: uploadResult.ok ? "copied" : "upload_error", copied: uploadResult.ok, bytesCopied: bytes.byteLength, receipt: uploadResult };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== CONFIRM) {
    return Response.json({ ok: false, status: "blocked", reason: "Missing required confirmation token." }, { status: 403 });
  }

  const token = getGoogleDriveToken();
  if (!token) {
    return Response.json(
      { ok: false, status: "blocked", reason: "Missing GOOGLE_DRIVE_ACCESS_TOKEN or GOOGLE_WORKSPACE_ACCESS_TOKEN." },
      { status: 403 }
    );
  }

  const receipts = [];
  for (const asset of approvedAssets) {
    receipts.push(await copyAsset(token, asset));
  }

  return Response.json({ ok: receipts.every((receipt) => receipt.status === "copied" || receipt.status === "exists"), targetFolderId: TARGET_FOLDER_ID, receipts });
}
