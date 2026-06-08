export type BrowserAction =
  | "open_url"
  | "read_page"
  | "extract_text"
  | "extract_links"
  | "screenshot"
  | "click"
  | "scroll"
  | "form_fill"
  | "type"
  | "select"
  | "wait_for_selector"
  | "validate_flow"
  | "submit_form"
  | "login"
  | "download"
  | "upload"
  | "purchase"
  | "post_social"
  | "send_message"
  | "delete";

export type BrowserMode = "dry_run" | "rest" | "headless" | "headful";

export type BrowserStep = {
  action: BrowserAction | string;
  url?: string;
  selector?: string;
  text?: string;
  value?: string;
  x?: number;
  y?: number;
  direction?: "up" | "down" | "left" | "right";
  amount?: number;
  description?: string;
};

export type BrowserJobPayload = {
  job_id: string;
  mode?: BrowserMode;
  url?: string;
  objective?: string;
  actions?: BrowserAction[] | string[];
  steps?: BrowserStep[];
  blocked_actions?: string[];
  approval_required?: boolean;
  browser_worker_url?: string;
  payload?: Record<string, unknown>;
};

const defaultBlockedActions = [
  "login",
  "submit_form",
  "purchase",
  "payment",
  "post_social",
  "send_message",
  "delete",
  "upload",
  "download",
  "credential_entry",
  "admin_change",
  "account_change"
];

const defaultReadOnlyActions = [
  "open_url",
  "read_page",
  "extract_text",
  "extract_links",
  "screenshot",
  "scroll",
  "wait_for_selector",
  "validate_flow"
];

function buildReceipt(input: BrowserJobPayload, status: "planned" | "blocked" | "queued") {
  return {
    receiptId: `browser_receipt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    provider: "browser",
    action: "run_browser_job",
    status,
    job_id: input.job_id,
    mode: input.mode ?? "dry_run"
  };
}

function isBlockedAction(action: string, blockedActions: string[]) {
  return blockedActions.some((blocked) => action === blocked || action.includes(blocked));
}

export function runBrowserJob(input: BrowserJobPayload) {
  const mode = input.mode ?? "dry_run";
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const actions = input.actions?.length ? input.actions : input.steps?.map((step) => step.action) ?? ["open_url", "read_page", "extract_links", "screenshot", "validate_flow"];
  const steps = input.steps?.length
    ? input.steps
    : actions.map((action) => ({ action, url: input.url, description: `Plan browser action: ${action}` }));

  const plannedOperations = steps.map((step, index) => ({
    step: index + 1,
    provider: "browser",
    mode,
    action: step.action,
    url: step.url ?? input.url,
    selector: step.selector,
    value_present: Boolean(step.value || step.text),
    status: isBlockedAction(String(step.action), blockedActions) ? "blocked_by_policy" : "planned",
    requires_approval: isBlockedAction(String(step.action), blockedActions) || !defaultReadOnlyActions.includes(String(step.action))
  }));

  const blockedOperations = plannedOperations.filter((operation) => operation.status === "blocked_by_policy");
  const workerUrl = input.browser_worker_url ?? process.env.BROWSER_WORKER_URL;
  const canQueueWorker = Boolean(workerUrl) && mode !== "dry_run" && blockedOperations.length === 0;

  return {
    ok: true,
    job_id: input.job_id,
    provider: "browser",
    mode,
    objective: input.objective ?? "Operate a governed browser workflow with receipts and approval gates.",
    url: input.url,
    browser_capabilities: [
      "open_url",
      "read_page",
      "extract_text",
      "extract_links",
      "screenshot",
      "click",
      "scroll",
      "form_fill",
      "type",
      "select",
      "wait_for_selector",
      "validate_flow"
    ],
    approval_required: input.approval_required ?? blockedOperations.length > 0 || mode !== "dry_run",
    blocked_actions: blockedActions,
    blocked_operations: blockedOperations,
    planned_operations: plannedOperations,
    receipts: [buildReceipt(input, blockedOperations.length ? "blocked" : canQueueWorker ? "queued" : "planned")],
    validation_status: blockedOperations.length ? "blocked" : "planned",
    execution_mode: canQueueWorker ? "worker_queue_ready" : mode === "dry_run" ? "dry_run_only" : "blocked_until_browser_worker_url",
    worker: {
      configured: Boolean(workerUrl),
      url_present: Boolean(workerUrl),
      note: workerUrl ? "Browser worker URL is configured for headless/headful routing." : "Set BROWSER_WORKER_URL to execute real Chromium jobs."
    },
    rollback_plan: "Dry-run and read-only browser jobs require no rollback. Mutating browser jobs require step-level receipts and manual rollback instructions.",
    next_actions: workerUrl
      ? ["Refresh MCP connector manifest.", "Run dry_run first.", "Approve blocked operations explicitly before execute/headful mode."]
      : ["Deploy a Browserless/Playwright worker or set BROWSER_WORKER_URL.", "Keep browser jobs in dry_run/rest planning mode until worker is verified."]
  };
}

export function browserClick(input: BrowserJobPayload & { selector?: string }) {
  return runBrowserJob({ ...input, actions: ["click"], steps: [{ action: "click", url: input.url, selector: input.selector, description: "Click selected element" }] });
}

export function browserScroll(input: BrowserJobPayload & { direction?: "up" | "down" | "left" | "right"; amount?: number }) {
  return runBrowserJob({ ...input, actions: ["scroll"], steps: [{ action: "scroll", url: input.url, direction: input.direction ?? "down", amount: input.amount ?? 800, description: "Scroll page" }] });
}

export function browserFormFill(input: BrowserJobPayload & { selector?: string; value?: string }) {
  return runBrowserJob({ ...input, actions: ["form_fill"], steps: [{ action: "form_fill", url: input.url, selector: input.selector, value: input.value, description: "Fill form field" }] });
}

export function browserScreenshot(input: BrowserJobPayload) {
  return runBrowserJob({ ...input, actions: ["screenshot"], steps: [{ action: "screenshot", url: input.url, description: "Capture screenshot" }] });
}

export function browserReadPage(input: BrowserJobPayload) {
  return runBrowserJob({ ...input, actions: ["open_url", "read_page", "extract_text", "extract_links"], steps: [
    { action: "open_url", url: input.url },
    { action: "read_page", url: input.url },
    { action: "extract_text", url: input.url },
    { action: "extract_links", url: input.url }
  ] });
}
