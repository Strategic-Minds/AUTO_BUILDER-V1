import { createSign } from "crypto";
import { EDEN_SKYE_FULL_SCAFFOLD_MANIFEST } from "./wave-2-adapters";

type DriveScaffoldChunk = "folders" | "admin_control_files" | "eden_docs" | "auto_social_docs" | "model_media_manifest";

type ChunkWriterInput = {
  approved?: boolean;
  approvalId?: string;
  approvalPhrase?: string;
  root_folder_id?: string;
  rootFolderId?: string;
  chunk?: string;
  maxFiles?: number;
};

type DriveItem = { id: string; name: string; mimeType: string; createdTime?: string; webViewLink?: string };
type WrittenItem = { path: string; id: string; action: "created" | "existing"; type: "folder" | "file"; webViewLink?: string };
type GoogleCredential = { clientEmail?: string; privateKey?: string; source: string };
type ScaffoldFile = { folder: string; name: string; body: string };

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const APPROVAL_PHRASE = "APPROVE DRIVE SCAFFOLD WRITE";
const AUTO_WORKFLOW_ROOT_FOLDER_ID = "13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM";

export const DRIVE_SCAFFOLD_CHUNKS: DriveScaffoldChunk[] = ["folders", "admin_control_files", "eden_docs", "auto_social_docs", "model_media_manifest"];

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
  "AUTO SOCIAL/00 ADMIN CONTROL/Approval Queue",
  "AUTO SOCIAL/00 ADMIN CONTROL/Publishing Command Center",
  "AUTO SOCIAL/00 ADMIN CONTROL/Content Review Desk",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Approval Queue",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Website Control Plan",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Model And Media Review",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Eden Closet Black Card",
  "EDEN SKYE STUDIOS/00 ADMIN CONTROL/Quarantine And Compliance"
];

const MODEL_COHORTS = [
  ["male_18_25", "Male 18-25", 20],
  ["female_18_25", "Female 18-25", 20],
  ["male_25_50", "Male 25-50", 20],
  ["female_25_50", "Female 25-50", 20],
  ["male_50_plus", "Male 50+", 10],
  ["female_50_plus", "Female 50+", 10],
  ["international", "International", 20],
  ["faceless", "Faceless Pages", 20],
  ["reserve_quarantine", "Reserve / Quarantine", 20]
] as const;

const ADMIN_CONTROL_FILES: ScaffoldFile[] = [
  doc("ADMIN CONTROL - READ FIRST", "00 START HERE - Admin Control Plan.md", "AUTO SOCIAL / Eden Skye Admin Control Plan", [
    "This folder is the human-readable control plane for approvals, daily operation, website build decisions, social publishing gates, Eden's Closet membership gates, Drive writes, agent activity, receipts, and quarantine review.",
    "Golden rule: the system may draft, queue, validate, analyze, and recommend. It may not publish, charge, message, release sensitive content, mutate production data, or move canon folders without an explicit approval record.",
    "Operator flow: review approvals, decide Drive/social/commerce/membership gates, inspect quarantine, review receipts, and feed approved website/admin changes into EdenSkyeStudios.com."
  ]),
  doc("ADMIN CONTROL - READ FIRST/00 Approval Center", "APPROVAL DASHBOARD.md", "Approval Dashboard", [
    "Drive scaffold writes: active only with APPROVE DRIVE SCAFFOLD WRITE.",
    "Website build: preview first, merge/deploy only after approval.",
    "Metricool publishing, Shopify/Xyla publication, checkout activation, adult-content release, and customer/member messages remain locked until exact owner approval."
  ]),
  doc("ADMIN CONTROL - READ FIRST/01 Daily Command Center", "24-7 OPERATING SCHEDULE.md", "24/7 Operating Schedule", [
    "Every 5 minutes: check queue health, failed jobs, stuck tasks, approval blockers, and new receipts.",
    "Hourly: draft content ideas, validate website tasks, inspect Metricool drafts, and update content queues.",
    "Daily and weekly: review approvals, model/account calendars, analytics, A/B tests, media cleanup, and system optimization."
  ]),
  doc("ADMIN CONTROL - READ FIRST/02 Website Admin Control Plan", "EDENSKYE STUDIOS WEBSITE CONTROL PLAN.md", "EdenSkyeStudios.com Website Control Plan", [
    "Required public surfaces: studio homepage, model discovery pages, faceless account pages, Eden's Closet landing page, Black Card membership page, age gate, terms, privacy, compliance, and consent pages.",
    "Required locked surfaces: member sign-in, member account, entitlement routing, admin approval dashboard, media library, publishing queue, quarantine admin, agent ops, and receipts dashboard.",
    "Backend feeds: model registry, media library, content queue, Metricool draft queue, Shopify/Xyla draft queue, membership entitlement map, approval receipts, memory, and reflection."
  ]),
  doc("ADMIN CONTROL - READ FIRST/03 Social Publishing Approvals", "SOCIAL APPROVAL QUEUE.md", "Social Approval Queue", [
    "Draft batch 001 remains draft-only until media, captions, account mappings, and approval receipts are present.",
    "No public posting, commenting, replies, DMs, paid campaigns, or adult/sensitive promotions are active from this scaffold."
  ]),
  doc("ADMIN CONTROL - READ FIRST/04 Eden Closet Black Card Approvals", "BLACK CARD MEMBERSHIP APPROVALS.md", "Eden's Closet Black Card Membership Approvals", [
    "Draft tiers: Black Card Monthly, Black Card Annual, and Founding Member.",
    "Required before activation: 18+ age gate, terms, privacy, consent records, payment processor policy review, content safety taxonomy, and manual owner approval.",
    "No checkout, billing, or adult-content release is active from this scaffold."
  ]),
  doc("ADMIN CONTROL - READ FIRST/05 Drive Write Approvals", "DRIVE WRITE RECEIPTS.md", "Drive Write Receipts", [
    "Approved chunk names: folders, admin_control_files, eden_docs, auto_social_docs, model_media_manifest.",
    "Deletes, renames, moves, live publishing, payment activation, adult-content release, and customer/member messages remain blocked."
  ]),
  doc("ADMIN CONTROL - READ FIRST/06 Quarantine Review", "QUARANTINE REVIEW RULES.md", "Quarantine Review Rules", [
    "Quarantine anything incomplete, low-confidence, duplicated, missing consent, sensitive, broken, off-brand, policy-risky, or not approved.",
    "No item leaves quarantine until it has an approval receipt, owner decision, or replacement draft."
  ]),
  doc("ADMIN CONTROL - READ FIRST/07 Agent Ops", "GPT AGENT OPERATING LOOP.md", "GPT Agent Operating Loop", [
    "DISCOVER -> VALIDATE -> BRAND -> BUILD -> DEPLOY -> DISTRIBUTE -> MONETIZE -> ANALYZE -> OPTIMIZE -> SCALE -> REPLICATE -> REPEAT.",
    "The agent drafts, validates, schedules internally, and prepares approval packets. Consequential actions require explicit approval."
  ]),
  doc("ADMIN CONTROL - READ FIRST/08 Receipts And Audit Log", "RECEIPTS INDEX.md", "Receipts Index", [
    "Every approved scaffold chunk should be followed by readback evidence.",
    "Receipt rows should include system, action, result, timestamp, and notes."
  ])
];

const EDEN_DOCS: ScaffoldFile[] = [
  doc("EDEN SKYE STUDIOS/00 Source Truth", "EDEN SKYE STUDIOS SOURCE OF TRUTH.md", "Eden Skye Studios Source Of Truth", ["Eden Skye Studios is the operating brand for the digital media, AI avatar, digital modeling, content creation, Eden's Closet membership, and social automation system.", "Primary systems: public website, locked membership, model/faceless registry, media library, content calendar, approval dashboard, publishing queue, quarantine, receipts, and GPT/Vercel Workflow loop."]),
  doc("EDEN SKYE STUDIOS/06 Business Control", "BUSINESS PLAN AND STRATEGY.md", "Business Plan And Strategy", ["Objective: build a governed automated digital media and AI avatar studio.", "Revenue paths: Eden's Closet Black Card membership, collaborations, digital products, affiliate/Shopify/Xyla commerce, content systems, and managed automation services.", "Start draft-only, validate signal, then activate after compliance, payment, approval, and receipt gates are complete."]),
  doc("EDEN SKYE STUDIOS/07 Brand System", "BRAND PACK.md", "Brand Pack", ["Positioning: luxury, modern, AI-native, aspirational, controlled, and performance-driven.", "Voice: confident, stylish, direct, high-signal, never spammy.", "Visual system: polished editorial imagery, clear account identity, stable naming, and platform-safe public creative."]),
  doc("EDEN SKYE STUDIOS/15 Content Calendar", "DRAFT CONTENT CALENDAR.md", "Draft Content Calendar", ["Morning: discovery hooks.", "Midday: value/content posts.", "Evening: Eden's Closet teasers.", "Overnight: international/faceless queue. All entries remain draft-only until approved."]),
  doc("EDEN SKYE STUDIOS/22 Website Build Packets", "VERCEL WORKFLOW BUILD PACKET.md", "Vercel Workflow Build Packet", ["Build public EdenSkyeStudios.com frontend, Eden's Closet locked backend, admin approval dashboard, media library, publishing queue, model registry, and agent ops/receipt dashboard.", "Runtime pattern: sandbox-first previews, Supabase dev branch validation, 5-minute Vercel cron supervisor, and approval-gated dispatch routes."])
];

const AUTO_SOCIAL_DOCS: ScaffoldFile[] = [
  doc("AUTO SOCIAL/00 Source Truth", "AUTO SOCIAL SOURCE OF TRUTH.md", "AUTO SOCIAL Source Of Truth", ["AUTO SOCIAL is the automation operating layer for discovery, planning, content creation, review, scheduling, validation, analysis, optimization, and growth.", "Locked until approved: public posting, commenting, replies, DMs, paid campaigns, live social dispatch, and adult/sensitive content release."]),
  doc("AUTO SOCIAL/06 Workflow Spine/WF-001 PLAN", "END TO END WORKFLOW PLAN.md", "End-To-End Workflow Plan", ["DISCOVER -> VALIDATE -> BRAND -> BUILD -> DEPLOY -> DISTRIBUTE -> MONETIZE -> ANALYZE -> OPTIMIZE -> SCALE -> REPLICATE -> REPEAT.", "Draft workflow: benchmark, validate, create prompts, quarantine risky assets, queue approved drafts, record receipts, optimize winners, and retire weak tests."]),
  doc("AUTO SOCIAL/10 Content Calendar", "AUTO SOCIAL CONTENT CALENDAR.md", "AUTO SOCIAL Content Calendar", ["00:00 international queue, 06:00 Instagram/TikTok hook, 12:00 Pinterest/YouTube repurpose, 18:00 Eden's Closet teaser.", "All rows stay draft until approval and media linkage are complete."]),
  doc("AUTO SOCIAL/12 Publishing Queue", "PUBLISHING QUEUE CONTROL.md", "Publishing Queue Control", ["Queue states: Draft -> Validate -> Approval Requested -> Approved -> Scheduled -> Posted -> Analyzed -> Optimized.", "Live publishing, comments, replies, DMs, paid campaigns, and sensitive/adult promos require explicit owner approval and a receipt."]),
  doc("AUTO SOCIAL/16 Validation", "VALIDATION AND HEALTH CHECKS.md", "Validation And Health Checks", ["Required checks: registry completeness, asset link validity, caption safety, approval receipt, quarantine clear, connector readiness, and website preview smoke test."])
];

const MODEL_MEDIA_DOCS: ScaffoldFile[] = [
  doc("EDEN SKYE STUDIOS/10 Model System/Model Registry", "MODEL REGISTRY MANIFEST.md", "Model Registry Manifest", [modelRegistryTable(), "Required record fields: model_id, display_name, cohort, age_band, region, persona, public_bio, social_voice, content_pillars, image_asset_ids, video_asset_ids, website_profile_url, metricool_account_map, shopify_xyla_map, approval_state, quarantine_state, and last_validation_receipt."]),
  doc("EDEN SKYE STUDIOS/10 Model System/00 Contact Sheets", "CONTACT SHEET INDEX.md", "Contact Sheet Index", ["Use this file to link collage/example images and generated individual model images once image packets are approved and uploaded.", modelCohortRows("Contact sheet pending")]),
  doc("EDEN SKYE STUDIOS/14 Media Generation/Image Prompts", "IMAGE GENERATION QUEUE.md", "Image Generation Queue", ["This queue is draft-only until the owner approves actual image generation/upload/linking batches.", modelCohortRows("Awaiting image approval")]),
  doc("EDEN SKYE STUDIOS/17 Supabase Runtime", "SUPABASE DATA CONTRACT.md", "Supabase Data Contract", ["Required tables should persist model profiles, faceless pages, asset records, content drafts, approval gates, publishing queues, engagement queues, experiments, agent runs, memory, quarantine, and receipts."])
];

function doc(folder: string, name: string, title: string, sections: string[]): ScaffoldFile {
  return { folder, name, body: `# ${title}\n\n${sections.join("\n\n")}\n` };
}

function modelCohortRows(status: string) {
  return ["| Cohort ID | Cohort | Count | Status |", "|---|---|---:|---|", ...MODEL_COHORTS.map((cohort) => `| ${cohort[0]} | ${cohort[1]} | ${cohort[2]} | ${status} |`)].join("\n");
}

function modelRegistryTable() {
  return ["| Cohort ID | Cohort | Target Count | Registry Status | Media Status |", "|---|---|---:|---|---|", ...MODEL_COHORTS.map((cohort) => `| ${cohort[0]} | ${cohort[1]} | ${cohort[2]} | Draft records required | Images pending approval/upload |`)].join("\n");
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
  return [...new Set(filesForChunk(chunk).map((file) => file.folder))];
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
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
      const credential = credentialFromParsedJson(JSON.parse(candidate), source);
      if (credential) return credential;
    } catch {
      // Try next supported credential shape.
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
  const jsonCredentialEnvNames = ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_CREDENTIALS_JSON", "GOOGLE_APPLICATION_CREDENTIALS_JSON", "GOOGLE_PRIVATE_KEY_JSON"];
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

function getDelegatedSubject() {
  return process.env.GOOGLE_IMPERSONATED_USER ?? process.env.GOOGLE_WORKSPACE_DELEGATED_USER ?? process.env.GOOGLE_DELEGATED_USER ?? process.env.GOOGLE_MAIL ?? process.env.GOOGLE_USER_EMAIL;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function escapeDriveQuery(value: string) {
  return value.replace(/'/g, "\\'");
}

async function getAccessToken() {
  const directAccessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN ?? process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (directAccessToken) return { accessToken: directAccessToken, ownershipMode: "direct_oauth_token", delegatedSubjectConfigured: false };

  const credentials = getGoogleCredentialInputs();
  if (!credentials.clientEmail || !credentials.privateKey) {
    throw new Error("Google Drive auth requires GOOGLE_DRIVE_ACCESS_TOKEN, GOOGLE_WORKSPACE_ACCESS_TOKEN, GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_CLIENT_EMAIL plus GOOGLE_PRIVATE_KEY.");
  }

  const delegatedSubject = getDelegatedSubject();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim: Record<string, string | number> = { iss: credentials.clientEmail, scope: DRIVE_SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now };
  if (delegatedSubject) claim.sub = delegatedSubject;

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
  if (!response.ok) throw new Error(`Google token request failed${delegatedSubject ? " with delegated Drive owner" : ""}: ${response.status} ${text}`);
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response did not include access_token.");
  return { accessToken: json.access_token, ownershipMode: delegatedSubject ? "workspace_delegated_user" : "service_account", delegatedSubjectConfigured: Boolean(delegatedSubject) };
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
  const multipart = [`--${boundary}`, "Content-Type: application/json; charset=UTF-8", "", JSON.stringify(metadata), `--${boundary}`, "Content-Type: text/markdown; charset=UTF-8", "", body, `--${boundary}--`, ""].join("\r\n");
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
  return { approved: true, approvalId: `drive-scaffold-${chunk}-${new Date().toISOString().slice(0, 10)}`, approvalPhrase: APPROVAL_PHRASE, root_folder_id: rootFolderId, chunk };
}

export async function runApprovedDriveScaffoldChunkWrite(input: ChunkWriterInput) {
  if (input.approved !== true || input.approvalPhrase !== APPROVAL_PHRASE || !input.approvalId) {
    return { ok: false, productionActionAllowed: false, status: "blocked", blocker: `Drive scaffold chunk writes require approved=true, approvalId, and approvalPhrase=${APPROVAL_PHRASE}.`, noMutationPerformed: true };
  }
  const chunk = normalizeChunk(input.chunk);
  if (!chunk) return { ok: false, productionActionAllowed: false, status: "blocked_unknown_chunk", allowedChunks: DRIVE_SCAFFOLD_CHUNKS, receivedChunk: input.chunk ?? null, noMutationPerformed: true };

  const rootFolderId = input.root_folder_id ?? input.rootFolderId ?? AUTO_WORKFLOW_ROOT_FOLDER_ID;
  const auth = await getAccessToken();
  const folderIds = new Map<string, string>();
  const folderEvents: WrittenItem[] = [];
  const fileEvents: WrittenItem[] = [];
  const folders = foldersForChunk(chunk);
  const files = filesForChunk(chunk).slice(0, input.maxFiles ?? 25);

  for (const path of folders) await ensurePath(auth.accessToken, rootFolderId, path, folderIds, folderEvents);
  for (const file of files) {
    const folderId = folderIds.get(file.folder) ?? await ensurePath(auth.accessToken, rootFolderId, file.folder, folderIds, folderEvents);
    fileEvents.push(await ensureMarkdownFile(auth.accessToken, folderId, file.folder, file.name, file.body));
  }

  return {
    ok: true,
    productionActionAllowed: false,
    status: "approved_chunk_write_complete",
    chunk,
    rootFolderId,
    approvalId: input.approvalId,
    approvalPhrase: input.approvalPhrase,
    ownershipMode: auth.ownershipMode,
    delegatedSubjectConfigured: auth.delegatedSubjectConfigured,
    folderManifestCount: folders.length,
    fileManifestCount: files.length,
    createdFolders: folderEvents.filter((event) => event.action === "created").length,
    existingFolders: folderEvents.filter((event) => event.action === "existing").length,
    createdFiles: fileEvents.filter((event) => event.action === "created").length,
    existingFiles: fileEvents.filter((event) => event.action === "existing").length,
    sampleFolders: folderEvents.slice(0, 12),
    sampleFiles: fileEvents.slice(0, 12),
    remainingChunks: DRIVE_SCAFFOLD_CHUNKS.filter((candidate) => candidate !== chunk),
    blockedActionsStillLocked: ["delete", "rename_existing", "move_existing", "publish", "deploy", "payment", "live_social", "adult_content_release", "customer_message"],
    nextAction: "Run Drive readback for this chunk, then run the next approved Drive scaffold chunk."
  };
}
