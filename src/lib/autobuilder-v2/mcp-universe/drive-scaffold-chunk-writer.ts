import { createSign } from "crypto";
import { EDEN_SKYE_FULL_SCAFFOLD_MANIFEST } from "./wave-2-adapters";

type DriveScaffoldChunk =
  | "folders"
  | "admin_control_files"
  | "eden_docs"
  | "auto_social_docs"
  | "model_media_manifest";

type ChunkWriterInput = {
  approved?: boolean;
  approvalId?: string;
  approvalPhrase?: string;
  root_folder_id?: string;
  rootFolderId?: string;
  chunk?: string;
  maxFiles?: number;
};

type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  webViewLink?: string;
};

type WrittenItem = {
  path: string;
  id: string;
  action: "created" | "existing";
  type: "folder" | "file";
  webViewLink?: string;
};

type GoogleCredential = {
  clientEmail?: string;
  privateKey?: string;
  source: string;
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const APPROVAL_PHRASE = "APPROVE DRIVE SCAFFOLD WRITE";
const AUTO_WORKFLOW_ROOT_FOLDER_ID = "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM";

export const DRIVE_SCAFFOLD_CHUNKS: DriveScaffoldChunk[] = [
  "folders",
  "admin_control_files",
  "eden_docs",
  "auto_social_docs",
  "model_media_manifest"
];

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

const MODEL_COHORTS = [
  ["male_18_25", "Male 18-25", 20, "Public-safe lifestyle, fitness, style, creator, and brand collaboration accounts."],
  ["female_18_25", "Female 18-25", 20, "Public-safe lifestyle, fashion, beauty, creator, and brand collaboration accounts."],
  ["male_25_50", "Male 25-50", 20, "Professional, luxury, fitness, executive, creator, and lifestyle accounts."],
  ["female_25_50", "Female 25-50", 20, "Professional, luxury, wellness, fashion, creator, and lifestyle accounts."],
  ["male_50_plus", "Male 50+", 10, "Mature luxury, leadership, wellness, travel, and lifestyle accounts."],
  ["female_50_plus", "Female 50+", 10, "Mature luxury, wellness, travel, beauty, and lifestyle accounts."],
  ["international", "International", 20, "Regionally diverse international fashion, travel, creator, and lifestyle accounts."],
  ["faceless", "Faceless Pages", 20, "Theme-led pages for luxury lifestyle, AI business, travel POV, fitness, wealth mindset, Eden Closet, and Black Card."],
  ["reserve_quarantine", "Reserve / Quarantine", 20, "Reserve identities, failed generations, duplicates, low-confidence assets, and items awaiting owner review."]
] as const;

const ADMIN_CONTROL_FILES = [
  {
    folder: "ADMIN CONTROL - READ FIRST",
    name: "00 START HERE - Admin Control Plan.md",
    body: `# AUTO SOCIAL / Eden Skye Admin Control Plan\n\nThis folder is the easy-to-read control plane for approvals, daily operation, website build decisions, social publishing gates, Eden's Closet membership gates, Drive writes, agent activity, receipts, and quarantine review.\n\n## Golden Rule\n\nThe system may draft, queue, validate, analyze, and recommend. It may not publish, charge, message, release sensitive content, mutate production data, or move canon folders without an explicit approval record.\n\n## Operator Flow\n\n1. Review Approval Queue.\n2. Approve or reject Drive writes, social drafts, Shopify/Xyla drafts, Metricool scheduling, and membership changes.\n3. Check Quarantine Review for failed, duplicate, sensitive, or low-confidence items.\n4. Review Receipts And Audit Log.\n5. Feed approved website/admin changes into EdenSkyeStudios.com.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/00 Approval Center",
    name: "APPROVAL DASHBOARD.md",
    body: `# Approval Dashboard\n\n| Queue | Status | Required Approval | Notes |\n|---|---|---|---|\n| Drive scaffold writes | Active | APPROVE DRIVE SCAFFOLD WRITE | Create missing folders and starter files only. |\n| Website build | Draft | Approve PR/deploy | Preview first. |\n| Metricool publishing | Locked | Approve each publish batch | Draft scheduling is allowed. |\n| Shopify/Xyla products | Locked | Approve product publication | Draft packets are allowed. |\n| Eden's Closet checkout | Locked | Approve payment activation | Compliance first. |\n| Adult content release | Locked | Explicit owner approval | Requires age gate, consent, taxonomy, and payment policy review. |\n| Customer/member messages | Locked | Approve each outbound batch | No autonomous DMs. |\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/01 Daily Command Center",
    name: "24-7 OPERATING SCHEDULE.md",
    body: `# 24/7 Operating Schedule\n\n## Every 5 Minutes\n- Check queue health, failed jobs, stuck tasks, approval blockers, and new receipts.\n- Run workflow supervisor in validation mode.\n- Move failed or unsafe items into quarantine.\n\n## Hourly\n- Draft content ideas, validate website tasks, inspect Metricool drafts, and update content queues.\n\n## Daily\n- Review approvals, model/account calendar, social queue, Eden's Closet queue, analytics, and agent reflection.\n\n## Weekly\n- A/B test review, offer/funnel review, model performance review, media library cleanup, and system optimization.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/02 Website Admin Control Plan",
    name: "EDENSKYE STUDIOS WEBSITE CONTROL PLAN.md",
    body: `# EdenSkyeStudios.com Website Control Plan\n\n## Required Public Surfaces\n- Studio homepage\n- Model discovery pages\n- Faceless account pages\n- Eden's Closet landing page\n- Black Card membership page\n- Age gate\n- Terms, privacy, compliance, and consent pages\n\n## Required Locked Surfaces\n- Member sign-in\n- Member account\n- Content entitlement routing\n- Admin approval dashboard\n- Content and media library admin\n- Publishing queue admin\n- Quarantine admin\n- Agent ops and receipts dashboard\n\n## Backend Feeds\n- Model registry\n- Media library\n- Content queue\n- Metricool draft queue\n- Shopify/Xyla draft queue\n- Membership entitlement map\n- Approval receipts\n- Agent memory and reflection\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/03 Social Publishing Approvals",
    name: "SOCIAL APPROVAL QUEUE.md",
    body: `# Social Approval Queue\n\n| Item | Platform | Model/Page | Asset | Caption | Status | Approval Receipt |\n|---|---|---|---|---|---|---|\n| Draft batch 001 | Instagram/TikTok/Pinterest | Pending registry link | Pending asset | Pending caption | Draft only | Pending |\n\nNo public posting, commenting, replies, DMs, paid campaigns, or adult/sensitive promotions are active from this scaffold.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/04 Eden Closet Black Card Approvals",
    name: "BLACK CARD MEMBERSHIP APPROVALS.md",
    body: `# Eden's Closet Black Card Membership Approvals\n\n## Draft Tiers\n- Black Card Monthly\n- Black Card Annual\n- Founding Member\n\n## Required Before Activation\n- 18+ age gate\n- Terms of service\n- Privacy policy\n- Creator/model consent records\n- Payment processor policy review\n- Content safety taxonomy\n- Manual owner approval\n\nNo checkout, billing, or adult-content release is active from this scaffold.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/05 Drive Write Approvals",
    name: "DRIVE WRITE RECEIPTS.md",
    body: `# Drive Write Receipts\n\nApproved scaffold chunks should write receipts here or into the connected Supabase receipt table once database persistence is active.\n\n## Approved Chunk Names\n- folders\n- admin_control_files\n- eden_docs\n- auto_social_docs\n- model_media_manifest\n\n## Locked Actions\nDeletes, renames, moves, live publishing, payment activation, adult-content release, and customer/member messages remain blocked.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/06 Quarantine Review",
    name: "QUARANTINE REVIEW RULES.md",
    body: `# Quarantine Review Rules\n\nQuarantine anything that is incomplete, low-confidence, duplicated, missing consent, sensitive, broken, off-brand, policy-risky, or not approved.\n\nNo item leaves quarantine until it has an approval receipt, owner decision, or replacement draft.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/07 Agent Ops",
    name: "GPT AGENT OPERATING LOOP.md",
    body: `# GPT Agent Operating Loop\n\nDISCOVER -> VALIDATE -> BRAND -> BUILD -> DEPLOY -> DISTRIBUTE -> MONETIZE -> ANALYZE -> OPTIMIZE -> SCALE -> REPLICATE -> REPEAT\n\n## 5-Minute Supervisor Checks\n- Queue health\n- Missing image or media links\n- Failed validation receipts\n- Quarantine items\n- Website/admin build state\n- Metricool, Shopify/Xyla, Supabase, and Drive readiness\n\n## Governance\nThe agent drafts, validates, schedules internally, and prepares approval packets. Consequential actions require explicit approval.\n`
  },
  {
    folder: "ADMIN CONTROL - READ FIRST/08 Receipts And Audit Log",
    name: "RECEIPTS INDEX.md",
    body: `# Receipts Index\n\n| Receipt | System | Action | Result | Timestamp | Notes |\n|---|---|---|---|---|---|\n| Pending | Drive | Chunked scaffold write | Pending | Pending | Use readback after every chunk. |\n`
  }
];

const EDEN_DOCS = [
  {
    folder: "EDEN SKYE STUDIOS/00 Source Truth",
    name: "EDEN SKYE STUDIOS SOURCE OF TRUTH.md",
    body: `# Eden Skye Studios Source Of Truth\n\nEden Skye Studios is the operating brand for the digital media, AI avatar, digital modeling, content creation, Eden's Closet membership, and social automation system.\n\n## Primary Systems\n- EdenSkyeStudios.com public website\n- Eden's Closet Black Card member experience\n- Model and faceless account registry\n- Media library\n- Content calendar\n- Approval dashboard\n- Publishing queue\n- Quarantine and receipts\n- GPT/Vercel Workflow operating loop\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/06 Business Control",
    name: "BUSINESS PLAN AND STRATEGY.md",
    body: `# Business Plan And Strategy\n\n## Objective\nBuild a governed, automated digital media and AI avatar studio that discovers, creates, validates, schedules, and optimizes content and offers while preserving approval gates for sensitive or consequential actions.\n\n## Revenue Paths\n- Eden's Closet Black Card membership\n- Brand collaborations\n- Digital products and templates\n- Affiliate and Shopify/Xyla commerce\n- Content systems and managed automation services\n\n## Operating Principle\nStart draft-only, validate signal, then activate only after compliance, payment, approval, and receipt gates are complete.\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/07 Brand System",
    name: "BRAND PACK.md",
    body: `# Brand Pack\n\n## Positioning\nLuxury, modern, AI-native, aspirational, controlled, and performance-driven.\n\n## Voice\nConfident, stylish, direct, high-signal, never spammy.\n\n## Visual System\nUse polished editorial imagery, clear model/account identity, stable naming, and platform-safe public creative.\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/15 Content Calendar",
    name: "DRAFT CONTENT CALENDAR.md",
    body: `# Draft Content Calendar\n\n| Daypart | Content Type | Model/Page | Asset Source | Approval Status |\n|---|---|---|---|---|\n| Morning | Discovery hook | Pending registry | Pending image link | Draft |\n| Midday | Value/content post | Pending registry | Pending image link | Draft |\n| Evening | Eden's Closet teaser | Pending registry | Pending image link | Draft |\n| Overnight | International/faceless queue | Pending registry | Pending image link | Draft |\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/22 Website Build Packets",
    name: "VERCEL WORKFLOW BUILD PACKET.md",
    body: `# Vercel Workflow Build Packet\n\n## Build Targets\n- Public EdenSkyeStudios.com frontend\n- Eden's Closet locked membership backend\n- Admin approval dashboard\n- Media library\n- Publishing queue\n- Model registry\n- Agent ops and receipt dashboard\n\n## Runtime Pattern\nUse sandbox-first previews, Supabase dev branch validation, 5-minute Vercel cron supervisor, and approval-gated dispatch routes.\n`
  }
];

const AUTO_SOCIAL_DOCS = [
  {
    folder: "AUTO SOCIAL/00 Source Truth",
    name: "AUTO SOCIAL SOURCE OF TRUTH.md",
    body: `# AUTO SOCIAL Source Of Truth\n\nAUTO SOCIAL is the automation operating layer for discovery, planning, content creation, review, scheduling, validation, analysis, optimization, and growth.\n\n## Locked Until Approved\n- Public posting\n- Commenting/replies/DMs\n- Paid campaigns\n- Live social dispatch\n- Adult/sensitive content release\n`
  },
  {
    folder: "AUTO SOCIAL/06 Workflow Spine/WF-001 PLAN",
    name: "END TO END WORKFLOW PLAN.md",
    body: `# End-To-End Workflow Plan\n\nDISCOVER -> VALIDATE -> BRAND -> BUILD -> DEPLOY -> DISTRIBUTE -> MONETIZE -> ANALYZE -> OPTIMIZE -> SCALE -> REPLICATE -> REPEAT\n\n## Draft Workflow\n1. Discover trends, benchmark accounts, and collect opportunities.\n2. Validate fit, compliance, brand, and monetization potential.\n3. Create draft content and media prompts.\n4. Quarantine risky or incomplete assets.\n5. Queue approved drafts for scheduling.\n6. Record receipts and analytics.\n7. Optimize winners and retire weak tests.\n`
  },
  {
    folder: "AUTO SOCIAL/10 Content Calendar",
    name: "AUTO SOCIAL CONTENT CALENDAR.md",
    body: `# AUTO SOCIAL Content Calendar\n\n| Slot | Channel | Account | Content Type | Asset | Caption | Status |\n|---|---|---|---|---|---|---|\n| 00:00 | International | Pending | Short-form | Pending | Pending | Draft |\n| 06:00 | Instagram/TikTok | Pending | Hook | Pending | Pending | Draft |\n| 12:00 | Pinterest/YouTube | Pending | Repurpose | Pending | Pending | Draft |\n| 18:00 | Eden's Closet | Pending | Offer teaser | Pending | Pending | Draft |\n`
  },
  {
    folder: "AUTO SOCIAL/12 Publishing Queue",
    name: "PUBLISHING QUEUE CONTROL.md",
    body: `# Publishing Queue Control\n\nDraft scheduling may be prepared. Live publishing, comments, replies, DMs, paid campaigns, and sensitive/adult promotions require explicit owner approval and a receipt.\n\n## Queue States\nDraft -> Validate -> Approval Requested -> Approved -> Scheduled -> Posted -> Analyzed -> Optimized\n`
  },
  {
    folder: "AUTO SOCIAL/16 Validation",
    name: "VALIDATION AND HEALTH CHECKS.md",
    body: `# Validation And Health Checks\n\n## Required Checks\n- Registry completeness\n- Asset link validity\n- Caption safety\n- Approval receipt present\n- Quarantine status clear\n- Metricool/Shopify/Xyla/Supabase/Drive readiness\n- Website preview smoke test\n`
  }
];

const MODEL_MEDIA_DOCS = [
  {
    folder: "EDEN SKYE STUDIOS/10 Model System/Model Registry",
    name: "MODEL REGISTRY MANIFEST.md",
    body: modelRegistryManifest()
  },
  {
    folder: "EDEN SKYE STUDIOS/10 Model System/00 Contact Sheets",
    name: "CONTACT SHEET INDEX.md",
    body: `# Contact Sheet Index\n\nUse this file to link collage/example images and generated individual model images once image packets are approved and uploaded.\n\n| Cohort | Contact Sheet | Individual Image Folder | Status |\n|---|---|---|---|\n${MODEL_COHORTS.map((cohort) => `| ${cohort[1]} | Pending Drive link | Pending image batch | Draft |`).join("\n")}\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/14 Media Generation/Image Prompts",
    name: "IMAGE GENERATION QUEUE.md",
    body: `# Image Generation Queue\n\nThis queue is draft-only until the owner approves actual image generation/upload/linking batches.\n\n| Batch | Cohort | Count | Destination | Status |\n|---|---|---:|---|---|\n${MODEL_COHORTS.map((cohort) => `| ${cohort[0]}_batch_001 | ${cohort[1]} | ${cohort[2]} | Eden Skye Studios model/media library | Awaiting image approval |`).join("\n")}\n`
  },
  {
    folder: "EDEN SKYE STUDIOS/17 Supabase Runtime",
    name: "SUPABASE DATA CONTRACT.md",
    body: `# Supabase Data Contract\n\nRequired tables should persist model profiles, faceless pages, asset records, content drafts, approval gates, publishing queues, engagement queues, experiments, agent runs, memory, quarantine, and receipts.\n\nEvery model/page record should include cohort, persona, public-safe bio, social voice, image asset links, content status, risk class, approval state, and last validation receipt.\n`
  }
];

function modelRegistryManifest() {
  return `# Model Registry Manifest\n\nThe registry is the canonical map for all model and faceless accounts. Use generated image asset IDs and Supabase record IDs after approved upload/linking.\n\n| Cohort ID | Cohort | Target Count | Registry Status | Media Status | Notes |\n|---|---|---:|---|---|---|\n${MODEL_COHORTS.map((cohort) => `| ${cohort[0]} | ${cohort[1]} | ${cohort[2]} | Draft records required | Images pending approval/upload | ${cohort[3]} |`).join("\n")}\n\n## Required Record Fields\n- model_id\n- display_name\n- cohort\n- age_band\n- region\n- persona\n- public_bio\n- social_voice\n- content_pillars\n- image_asset_ids\n- video_asset_ids\n- website_profile_url\n- metricool_account_map\n- shopify_xyla_map\n- approval_state\n- quarantine_state\n- last_validation_receipt\n`;
}

function filesForChunk(chunk: DriveScaffoldChunk) {
  if (chunk === "admin_control_files") return ADMIN_CONTROL_FILES;
  if (chunk === "eden_docs") return EDEN_DOCS;
  if (chunk === "auto_social_docs") return AUTO_SOCIAL_DOCS;
  if (chunk === "model_media_manifest") return MODEL_MEDIA_DOCS;
  return [];
}

function foldersForChunk(chunk: DriveScaffoldChunk) {
  if (chunk === "folders") return [...new Set([...EDEN_SKYE_FULL_SCAFFOLD_MANIFEST, ...ADMIN_CONTROL_FOLDERS])];
  return [...new Set([...filesForChunk(chunk).map((file) => file.folder), ...ADMIN_CONTROL_FOLDERS.filter((path) => filesForChunk(chunk).some((file) => file.folder.startsWith(path)))])];
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function decodeBase64Maybe(value: string) {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded.trim() ? decoded : null;
  } catch {
    return null;
  }
}

function credentialFromParsedJson(parsed: unknown, source: string): GoogleCredential | null {
  if (typeof parsed === "string") return parseGoogleCredentialJson(parsed, `${source}_nested_string`);
  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as { client_email?: unknown; clientEmail?: unknown; private_key?: unknown; privateKey?: unknown };
  const clientEmail = typeof record.client_email === "string" ? record.client_email : typeof record.clientEmail === "string" ? record.clientEmail : undefined;
  const privateKey = typeof record.private_key === "string" ? record.private_key : typeof record.privateKey === "string" ? record.privateKey : undefined;
  if (clientEmail || privateKey) return { clientEmail, privateKey, source };
  return null;
}

function parseGoogleCredentialJson(value: string, source: string): GoogleCredential | null {
  const raw = stripWrappingQuotes(value);
  const decoded = decodeBase64Maybe(raw);
  const candidates = [value.trim(), raw, decoded].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const credential = credentialFromParsedJson(parsed, source);
      if (credential) return credential;
    } catch {
      // Try the next supported credential shape.
    }
  }
  return null;
}

function normalizePrivateKey(value: string) {
  const parsedJson = parseGoogleCredentialJson(value, "GOOGLE_PRIVATE_KEY_JSON");
  const rawKey = parsedJson?.privateKey ?? value;
  const unwrapped = stripWrappingQuotes(rawKey).replace(/\\n/g, "\n");
  if (unwrapped.includes("-----BEGIN")) return unwrapped;
  const decoded = decodeBase64Maybe(unwrapped)?.replace(/\\n/g, "\n");
  if (decoded?.includes("-----BEGIN")) return decoded;
  return unwrapped;
}

function getGoogleCredentialInputs(): GoogleCredential {
  const jsonCredentialEnvNames = [
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GOOGLE_CREDENTIALS_JSON",
    "GOOGLE_APPLICATION_CREDENTIALS_JSON",
    "GOOGLE_PRIVATE_KEY_JSON"
  ];
  let partialJsonCredential: GoogleCredential | null = null;

  for (const envName of jsonCredentialEnvNames) {
    const jsonCredential = process.env[envName];
    if (!jsonCredential) continue;
    const parsed = parseGoogleCredentialJson(jsonCredential, envName);
    if (parsed?.clientEmail && parsed.privateKey) return parsed;
    if (parsed && !partialJsonCredential) partialJsonCredential = parsed;
  }

  const privateKeyFromEnv = process.env.GOOGLE_PRIVATE_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const parsedPrivateKeyJson = privateKeyFromEnv ? parseGoogleCredentialJson(privateKeyFromEnv, "private_key_env_json") : null;
  const partial = partialJsonCredential ?? parsedPrivateKeyJson;

  return {
    clientEmail: partial?.clientEmail ?? process.env.GOOGLE_CLIENT_EMAIL ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: partial?.privateKey ?? parsedPrivateKeyJson?.privateKey ?? privateKeyFromEnv,
    source: partial ? `${partial.source}_with_split_env_fallback` : parsedPrivateKeyJson ? "private_key_env_json" : "separate_env_values"
  };
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function escapeDriveQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

async function getAccessToken() {
  const directAccessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN ?? process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (directAccessToken) return directAccessToken;

  const credentials = getGoogleCredentialInputs();
  if (!credentials.clientEmail || !credentials.privateKey) {
    throw new Error("Google Drive auth requires GOOGLE_DRIVE_ACCESS_TOKEN, GOOGLE_WORKSPACE_ACCESS_TOKEN, GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_CLIENT_EMAIL plus GOOGLE_PRIVATE_KEY.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = { iss: credentials.clientEmail, scope: DRIVE_SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now };
  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  let signature: Buffer;
  try {
    signature = signer.sign(normalizePrivateKey(credentials.privateKey));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Google private key signing failed from ${credentials.source}: ${message}`);
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${signingInput}.${base64Url(signature)}` })
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Google token request failed: ${response.status} ${text}`);
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response did not include access_token.");
  return json.access_token;
}

async function driveFetch<T>(accessToken: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { authorization: `Bearer ${accessToken}`, ...(init?.headers ?? {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Drive request failed: ${response.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function findChild(accessToken: string, parentId: string, name: string, mimeType?: string) {
  const params = new URLSearchParams({
    q: `'${escapeDriveQuery(parentId)}' in parents and name = '${escapeDriveQuery(name)}' and trashed = false${mimeType ? ` and mimeType = '${mimeType}'` : ""}`,
    fields: "files(id,name,mimeType,createdTime,webViewLink)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    orderBy: "createdTime"
  });
  const result = await driveFetch<{ files: DriveItem[] }>(accessToken, `${DRIVE_API}/files?${params.toString()}`);
  return [...result.files].sort((a, b) => (a.createdTime ?? "").localeCompare(b.createdTime ?? ""))[0] ?? null;
}

async function ensureFolder(accessToken: string, parentId: string, name: string): Promise<WrittenItem> {
  const existing = await findChild(accessToken, parentId, name, "application/vnd.google-apps.folder");
  if (existing) return { path: name, id: existing.id, action: "existing", type: "folder", webViewLink: existing.webViewLink };

  const created = await driveFetch<DriveItem>(accessToken, `${DRIVE_API}/files?supportsAllDrives=true&fields=id,name,mimeType,createdTime,webViewLink`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId], appProperties: { autoBuilderScaffold: "true" } })
  });
  return { path: name, id: created.id, action: "created", type: "folder", webViewLink: created.webViewLink };
}

async function ensurePath(accessToken: string, rootFolderId: string, path: string, folderIds: Map<string, string>, events: WrittenItem[]) {
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

async function ensureMarkdownFile(accessToken: string, parentId: string, path: string, name: string, body: string): Promise<WrittenItem> {
  const existing = await findChild(accessToken, parentId, name);
  if (existing) return { path: `${path}/${name}`, id: existing.id, action: "existing", type: "file", webViewLink: existing.webViewLink };

  const boundary = `auto_builder_chunk_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const metadata = { name, mimeType: "application/vnd.google-apps.document", parents: [parentId], appProperties: { autoBuilderScaffold: "true" } };
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

function normalizeChunk(value: string | undefined): DriveScaffoldChunk | null {
  if (!value) return null;
  return DRIVE_SCAFFOLD_CHUNKS.includes(value as DriveScaffoldChunk) ? value as DriveScaffoldChunk : null;
}

export function buildDriveScaffoldChunkPayload(chunk: DriveScaffoldChunk, rootFolderId = AUTO_WORKFLOW_ROOT_FOLDER_ID): ChunkWriterInput {
  return {
    approved: true,
    approvalId: `drive-scaffold-${chunk}-${new Date().toISOString().slice(0, 10)}`,
    approvalPhrase: APPROVAL_PHRASE,
    root_folder_id: rootFolderId,
    chunk
  };
}

export async function runApprovedDriveScaffoldChunkWrite(input: ChunkWriterInput) {
  if (input.approved !== true || input.approvalPhrase !== APPROVAL_PHRASE || !input.approvalId) {
    return {
      ok: false,
      productionActionAllowed: false,
      status: "blocked",
      blocker: `Drive scaffold chunk writes require approved=true, approvalId, and approvalPhrase=${APPROVAL_PHRASE}.`,
      noMutationPerformed: true
    };
  }

  const chunk = normalizeChunk(input.chunk);
  if (!chunk) {
    return {
      ok: false,
      productionActionAllowed: false,
      status: "blocked_unknown_chunk",
      allowedChunks: DRIVE_SCAFFOLD_CHUNKS,
      receivedChunk: input.chunk ?? null,
      noMutationPerformed: true
    };
  }

  const rootFolderId = input.root_folder_id ?? input.rootFolderId ?? AUTO_WORKFLOW_ROOT_FOLDER_ID;
  const accessToken = await getAccessToken();
  const folderIds = new Map<string, string>();
  const folderEvents: WrittenItem[] = [];
  const fileEvents: WrittenItem[] = [];
  const folders = foldersForChunk(chunk);
  const files = filesForChunk(chunk).slice(0, input.maxFiles ?? 25);

  for (const path of folders) {
    await ensurePath(accessToken, rootFolderId, path, folderIds, folderEvents);
  }

  for (const file of files) {
    const folderId = folderIds.get(file.folder) ?? await ensurePath(accessToken, rootFolderId, file.folder, folderIds, folderEvents);
    fileEvents.push(await ensureMarkdownFile(accessToken, folderId, file.folder, file.name, file.body));
  }

  const createdFolders = folderEvents.filter((event) => event.action === "created").length;
  const existingFolders = folderEvents.filter((event) => event.action === "existing").length;
  const createdFiles = fileEvents.filter((event) => event.action === "created").length;
  const existingFiles = fileEvents.filter((event) => event.action === "existing").length;

  return {
    ok: true,
    productionActionAllowed: false,
    status: "approved_chunk_write_complete",
    chunk,
    rootFolderId,
    approvalId: input.approvalId,
    approvalPhrase: input.approvalPhrase,
    folderManifestCount: folders.length,
    fileManifestCount: files.length,
    createdFolders,
    existingFolders,
    createdFiles,
    existingFiles,
    sampleFolders: folderEvents.slice(0, 12),
    sampleFiles: fileEvents.slice(0, 12),
    remainingChunks: DRIVE_SCAFFOLD_CHUNKS.filter((candidate) => candidate !== chunk),
    blockedActionsStillLocked: ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social", "adult_content_release", "customer_message"],
    nextAction: "Run the next approved Drive scaffold chunk, then verify readback from the target folder."
  };
}
