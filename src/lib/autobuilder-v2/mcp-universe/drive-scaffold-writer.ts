import { createSign } from "crypto";
import { EDEN_SKYE_FULL_SCAFFOLD_MANIFEST } from "./wave-2-adapters";

type DriveWriterInput = {
  approved?: boolean;
  approvalId?: string;
  approvalPhrase?: string;
  root_folder_id?: string;
  folder_manifest?: string[];
  create_readme_files?: boolean;
  create_admin_control_pack?: boolean;
};

type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
};

type CreatedItem = {
  path: string;
  id: string;
  action: "created" | "existing";
  type: "folder" | "file";
  webViewLink?: string;
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const APPROVAL_PHRASE = "APPROVE DRIVE SCAFFOLD WRITE";
const DEFAULT_ROOT_FOLDER_ID = "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80";

const ADMIN_CONTROL_FOLDERS = [
  "ADMIN CONTROL - READ FIRST",
  "ADMIN CONTROL - READ FIRST/00 Approval Center",
  "ADMIN CONTROL - READ FIRST/01 Daily Command Center",
  "ADMIN CONTROL - READ FIRST/02 Website Admin Control Plan",
  "ADMIN CONTROL - READ FIRST/03 Social Publishing Approvals",
  "ADMIN CONTROL - READ FIRST/04 Eden Closet Black Card Approvals",
  "ADMIN CONTROL - READ FIRST/05 Drive Write Approvals",
  "ADMIN CONTROL - READ FIRST/06 Quarantine Review",
  "ADMIN CONTROL - READ FIRST/07 Agent Ops",
  "ADMIN CONTROL - READ FIRST/08 Receipts And Audit Log",
  "AUTO SOCIAL/00 ADMIN CONTROL",
  "AUTO SOCIAL/00 ADMIN CONTROL/Approval Queue",
  "AUTO SOCIAL/00 ADMIN CONTROL/Publishing Command Center",
  "AUTO SOCIAL/00 ADMIN CONTROL/Content Review Desk",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Approval Queue",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Website Control Plan",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Model And Media Review",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Eden Closet Black Card",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Quarantine And Compliance"
];

const ADMIN_CONTROL_FILES = [
  {
    folder: "ADMIN CONTROL - READ FIRST",
    name: "00 START HERE - Admin Control Plan.md",
    body: `# AUTO SOCIAL / Eden Skye Admin Control Plan\n\nThis folder is the human-readable control plane for approvals, daily operation, website build decisions, social publishing gates, Eden's Closet membership gates, Drive writes, agent activity, receipts, and quarantine review.\n\n## Golden Rule\n\nThe system may draft, queue, validate, analyze, and recommend. It may not publish, charge, message, release sensitive content, or mutate canon folders without an explicit approval record.\n\n## Operator Flow\n\n1. Review Approval Queue.\n2. Approve or reject Drive writes, social posts, Shopify/Xyla drafts, Metricool scheduling, and membership changes.\n3. Check Quarantine Review for failed or sensitive items.\n4. Review Receipts And Audit Log.\n5. Feed approved website/admin changes into EdenSkyeStudios.com.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/00 Approval Center",
    name: "APPROVAL DASHBOARD.md",
    body: `# Approval Dashboard\n\n| Queue | Status | Required Approval | Notes |\n|---|---|---|---|\n| Drive scaffold writes | Active | APPROVE DRIVE SCAFFOLD WRITE | Create missing folders and starter files only. |\n| Website build | Draft | Approve PR/deploy | Preview first. |\n| Metricool publishing | Locked | Approve each publish batch | Draft scheduling is allowed. |\n| Shopify/Xyla products | Locked | Approve product publication | Draft packets are allowed. |\n| Eden's Closet checkout | Locked | Approve payment activation | Compliance first. |\n| Adult content release | Locked | Explicit owner approval | Requires age gate, consent, taxonomy, and payment policy review. |\n| Customer/member messages | Locked | Approve each outbound batch | No autonomous DMs. |\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/01 Daily Command Center",
    name: "24-7 OPERATING SCHEDULE.md",
    body: `# 24/7 Operating Schedule\n\n## Every 5 Minutes\n- Check queue health, failed jobs, stuck tasks, approval blockers, and new receipts.\n\n## Hourly\n- Draft content ideas, validate website tasks, inspect Metricool drafts, update quarantine.\n\n## Daily\n- Review approvals, model/account calendar, social queue, Eden's Closet queue, analytics, and agent reflection.\n\n## Weekly\n- A/B test review, offer/funnel review, model performance review, asset library cleanup, and system optimization.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/02 Website Admin Control Plan",
    name: "EDENSKYE STUDIOS WEBSITE CONTROL PLAN.md",
    body: `# EdenSkyeStudios.com Website Control Plan\n\n## Required Surfaces\n- Public studio homepage\n- Model discovery pages\n- Faceless account pages\n- Eden's Closet landing page\n- Black Card membership page\n- Member sign-in\n- Age gate\n- Member account\n- Admin approval dashboard\n- Content/media library admin\n- Publishing queue admin\n- Quarantine admin\n\n## Backend Feeds\n- Model registry\n- Media library\n- Content queue\n- Metricool draft queue\n- Shopify/Xyla draft queue\n- Membership entitlement map\n- Approval receipts\n- Agent memory and reflection\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/06 Quarantine Review",
    name: "QUARANTINE REVIEW RULES.md",
    body: `# Quarantine Review Rules\n\nQuarantine anything that is incomplete, low-confidence, missing consent, sensitive, broken, off-brand, policy-risky, payment-risky, or not approved.\n\nNo item leaves quarantine until it has an approval receipt, owner decision, or replacement draft.\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Eden Closet Black Card",
    name: "BLACK CARD MEMBERSHIP APPROVALS.md",
    body: `# Eden's Closet Black Card Membership Approvals\n\n## Draft Tiers\n- Black Card Monthly\n- Black Card Annual\n- Founding Member\n\n## Required Before Activation\n- 18+ age gate\n- Terms of service\n- Privacy policy\n- Creator/model consent records\n- Payment processor policy review\n- Content safety taxonomy\n- Manual owner approval\n\nNo checkout, billing, or adult-content release is active from this scaffold.\n`
  },
  {
    folder: "AUTO SOCIAL/00 ADMIN CONTROL/Publishing Command Center",
    name: "METRICOOL PUBLISHING APPROVALS.md",
    body: `# Metricool Publishing Approvals\n\nDraft scheduling and analytics are allowed. Public posting, comments, replies, DMs, paid campaigns, and adult/sensitive promos require explicit owner approval.\n\n## Review Fields\n- Platform\n- Account/model\n- Asset\n- Caption\n- Hashtags\n- Publish window\n- Risk class\n- Approval status\n- Receipt ID\n`
  }
];

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizePrivateKey(value: string) {
  let key = value.trim();

  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  key = key.replace(/\\n/g, "\n");

  if (key.includes("-----BEGIN PRIVATE KEY-----")) {
    return key;
  }

  try {
    const decoded = Buffer.from(key, "base64").toString("utf8").trim().replace(/\\n/g, "\n");
    if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
      return decoded;
    }
  } catch {
    // Fall through and let crypto surface the original key-format error.
  }

  return key;
}

function escapeDriveQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

function pathReadme(path: string) {
  const title = path.split("/").at(-1) ?? path;
  return `# ${title}\n\nDrive path: ${path}\n\n## Purpose\n\nThis folder is part of the Eden Skye Studios / AUTO SOCIAL operating system. It is scaffolded so automation, admin review, website feeds, queues, receipts, and approvals have a stable place to work from.\n\n## Operating Status\n\n- Created by AUTO BUILDER approved Drive scaffold writer.\n- Live publishing, payment activation, member messaging, adult-content release, destructive moves, and public deployment remain approval-gated.\n- Use receipts and approval files before moving anything into active operation.\n`;
}

async function getAccessToken() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account env is missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(privateKey));
  const assertion = `${signingInput}.${base64Url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status} ${text}`);
  }

  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response did not include access_token.");
  return json.access_token;
}

async function driveFetch<T>(accessToken: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Drive request failed: ${response.status} ${text}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

async function findChild(accessToken: string, parentId: string, name: string, mimeType?: string) {
  const params = new URLSearchParams({
    q: `'${escapeDriveQuery(parentId)}' in parents and name = '${escapeDriveQuery(name)}' and trashed = false${mimeType ? ` and mimeType = '${mimeType}'` : ""}`,
    fields: "files(id,name,mimeType,webViewLink)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true"
  });
  const result = await driveFetch<{ files: DriveItem[] }>(accessToken, `${DRIVE_API}/files?${params.toString()}`);
  return result.files[0] ?? null;
}

async function ensureFolder(accessToken: string, parentId: string, name: string): Promise<CreatedItem> {
  const existing = await findChild(accessToken, parentId, name, "application/vnd.google-apps.folder");
  if (existing) return { path: name, id: existing.id, action: "existing", type: "folder", webViewLink: existing.webViewLink };

  const created = await driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files?supportsAllDrives=true&fields=id,name,mimeType,webViewLink`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId]
    })
  });
  return { path: name, id: created.id, action: "created", type: "folder", webViewLink: created.webViewLink };
}

async function ensurePath(accessToken: string, rootFolderId: string, path: string, folderIds: Map<string, string>, events: CreatedItem[]) {
  const parts = path.split("/").filter(Boolean);
  let parentId = rootFolderId;
  let currentPath = "";

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const known = folderIds.get(currentPath);
    if (known) {
      parentId = known;
      continue;
    }
    const result = await ensureFolder(accessToken, parentId, part);
    events.push({ ...result, path: currentPath });
    folderIds.set(currentPath, result.id);
    parentId = result.id;
  }

  return parentId;
}

async function ensureMarkdownFile(accessToken: string, parentId: string, path: string, name: string, body: string): Promise<CreatedItem> {
  const existing = await findChild(accessToken, parentId, name);
  if (existing) return { path: `${path}/${name}`, id: existing.id, action: "existing", type: "file", webViewLink: existing.webViewLink };

  const boundary = `auto_builder_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const metadata = {
    name,
    mimeType: "application/vnd.google-apps.document",
    parents: [parentId]
  };
  const multipart = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: text/markdown; charset=UTF-8",
    "",
    body,
    `--${boundary}--`,
    ""
  ].join("\r\n");

  const created = await driveFetch<DriveItem>(accessToken, `${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,webViewLink`, {
    method: "POST",
    headers: { "content-type": `multipart/related; boundary=${boundary}` },
    body: multipart
  });

  return { path: `${path}/${name}`, id: created.id, action: "created", type: "file", webViewLink: created.webViewLink };
}

export function buildApprovedDriveScaffoldPayload(): DriveWriterInput {
  return {
    approved: true,
    approvalId: `drive-scaffold-${new Date().toISOString().slice(0, 10)}`,
    approvalPhrase: APPROVAL_PHRASE,
    root_folder_id: DEFAULT_ROOT_FOLDER_ID,
    folder_manifest: [...EDEN_SKYE_FULL_SCAFFOLD_MANIFEST, ...ADMIN_CONTROL_FOLDERS],
    create_readme_files: true,
    create_admin_control_pack: true
  };
}

export async function runApprovedDriveScaffoldWrite(input: DriveWriterInput) {
  if (input.approved !== true || input.approvalPhrase !== APPROVAL_PHRASE || !input.approvalId) {
    return {
      ok: false,
      productionActionAllowed: false,
      status: "blocked",
      blocker: `Drive scaffold writes require approved=true, approvalId, and approvalPhrase=${APPROVAL_PHRASE}.`,
      noMutationPerformed: true
    };
  }

  const rootFolderId = input.root_folder_id || DEFAULT_ROOT_FOLDER_ID;
  const manifest = [...new Set([...(input.folder_manifest ?? EDEN_SKYE_FULL_SCAFFOLD_MANIFEST), ...ADMIN_CONTROL_FOLDERS])];
  const accessToken = await getAccessToken();
  const folderIds = new Map<string, string>();
  const events: CreatedItem[] = [];
  const fileEvents: CreatedItem[] = [];

  for (const path of manifest) {
    await ensurePath(accessToken, rootFolderId, path, folderIds, events);
  }

  if (input.create_readme_files !== false) {
    for (const path of manifest) {
      const folderId = folderIds.get(path) ?? await ensurePath(accessToken, rootFolderId, path, folderIds, events);
      fileEvents.push(await ensureMarkdownFile(accessToken, folderId, path, "README - OPERATING NOTES.md", pathReadme(path)));
    }
  }

  if (input.create_admin_control_pack !== false) {
    for (const file of ADMIN_CONTROL_FILES) {
      const folderId = folderIds.get(file.folder) ?? await ensurePath(accessToken, rootFolderId, file.folder, folderIds, events);
      fileEvents.push(await ensureMarkdownFile(accessToken, folderId, file.folder, file.name, file.body));
    }
  }

  const createdFolders = events.filter((event) => event.action === "created").length;
  const existingFolders = events.filter((event) => event.action === "existing").length;
  const createdFiles = fileEvents.filter((event) => event.action === "created").length;
  const existingFiles = fileEvents.filter((event) => event.action === "existing").length;

  return {
    ok: true,
    productionActionAllowed: false,
    status: "approved_write_complete",
    rootFolderId,
    approvalId: input.approvalId,
    approvalPhrase: input.approvalPhrase,
    folderManifestCount: manifest.length,
    createdFolders,
    existingFolders,
    createdFiles,
    existingFiles,
    sampleCreatedFolders: events.filter((event) => event.action === "created").slice(0, 12),
    sampleFiles: fileEvents.slice(0, 12),
    blockedActionsStillLocked: ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social", "adult_content_release", "customer_message"],
    nextAction: "List the Drive roots and use the ADMIN CONTROL - READ FIRST folder as the website/admin-control source plan."
  };
}
