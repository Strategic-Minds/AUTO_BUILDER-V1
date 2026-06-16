import { defineHook, getWritable, sleep } from "workflow";

import {
  getVercelRedeployReadiness,
  triggerVercelRedeploy,
  type RedeployMode,
  type RedeployTarget,
} from "@/lib/bridges/vercelRedeployBridge";
import { insertTelemetry } from "@/lib/telemetry-store";

export type HandoffRunMode = "dry_run" | "execute";

type RedeployResult = Awaited<ReturnType<typeof triggerVercelRedeploy>>;

export type AutoBuilderHandoffWorkflowInput = {
  workflowId?: string;
  targetSystem?: RedeployTarget;
  mode?: HandoffRunMode;
  deploymentMode?: RedeployMode;
  ref?: string;
  sha?: string;
  requestedBy?: string;
  verifyRoutes?: string[];
  maxPolls?: number;
  pollInterval?: string;
  pollIntervalMs?: number;
  approvedProductionDeploy?: boolean;
  approvalPhrase?: string;
  metadata?: Record<string, string>;
};

export type ProductionApprovalPayload = {
  approved: boolean;
  approvedBy?: string;
  comment?: string;
  approvalPhrase?: string;
};

export type HandoffWorkflowEvent = {
  type:
    | "step_start"
    | "step_done"
    | "awaiting_approval"
    | "approval_result"
    | "deployment_poll"
    | "route_verification"
    | "receipt_written"
    | "done"
    | "blocked";
  at: string;
  step?: string;
  status?: string;
  message?: string;
  token?: string;
  data?: Record<string, unknown>;
  nextActions?: string[];
};

type NormalizedInput = Required<Pick<AutoBuilderHandoffWorkflowInput, "targetSystem" | "mode" | "deploymentMode" | "ref" | "requestedBy" | "verifyRoutes" | "maxPolls">> & {
  workflowId: string;
  pollIntervalMs: number;
  sha?: string;
  approvedProductionDeploy?: boolean;
  approvalPhrase?: string;
  metadata?: Record<string, string>;
};

type DeploymentStatus = {
  ok: boolean;
  status: number;
  state: string | null;
  readyState: string | null;
  deploymentUrl: string | null;
  id: string | null;
  error?: string;
};

const DEFAULT_VERIFY_ROUTES = [
  "/api/runtime/readiness",
  "/api/runtime/jobs",
  "/api/browser/process",
  "/api/bridge/vercel/redeploy",
  "/api/mcp/manifest",
];

export const productionDeployApprovalHook = defineHook<ProductionApprovalPayload>();

export async function autoBuilderHandoffWorkflow(input: AutoBuilderHandoffWorkflowInput = {}) {
  "use workflow";

  const normalized = normalizeInput(input);
  await emitEvent({
    type: "step_start",
    step: "handoff_workflow",
    status: "running",
    message: "AUTO BUILDER handoff workflow started.",
    data: {
      workflowId: normalized.workflowId,
      targetSystem: normalized.targetSystem,
      mode: normalized.mode,
      deploymentMode: normalized.deploymentMode,
    },
  });

  const readiness = await readRedeployReadiness();
  await emitEvent({
    type: "step_done",
    step: "readiness",
    status: readiness.ok ? "ready" : "blocked",
    data: readiness as unknown as Record<string, unknown>,
  });

  if (normalized.mode !== "execute") {
    const receipt = await writeWorkflowReceipt({
      workflowId: normalized.workflowId,
      status: "planned",
      summary: "Vercel Workflow handoff dry-run completed without external mutation.",
      evidence: { readiness, normalized },
      blocker: null,
    });
    await emitEvent({ type: "done", step: "dry_run", status: "planned", data: { receipt } });
    return {
      ok: true,
      status: "planned",
      mode: normalized.mode,
      deploymentMode: normalized.deploymentMode,
      readiness,
      receipt,
      nextActions: ["Start the workflow with mode=execute for preview redeploy automation."],
    };
  }

  const productionApproval =
    normalized.deploymentMode === "production"
      ? await resolveProductionApproval(normalized)
      : { approved: true, approvalPhrase: undefined, source: "not_required" };

  if (!productionApproval.approved) {
    const receipt = await writeWorkflowReceipt({
      workflowId: normalized.workflowId,
      status: "blocked",
      summary: "Production deployment stayed blocked inside Vercel Workflow.",
      evidence: { readiness, productionApproval },
      blocker: "Production deploy requires APPROVE PRODUCTION DEPLOY.",
    });
    await emitEvent({
      type: "blocked",
      step: "production_approval",
      status: "blocked",
      message: "Production deploy approval was not granted.",
      data: { receipt },
      nextActions: ["Resume the approval hook with the production phrase only when production deploy is approved."],
    });
    return {
      ok: false,
      status: "blocked",
      deploymentMode: normalized.deploymentMode,
      receipt,
      requiredApprovalPhrase: "APPROVE PRODUCTION DEPLOY",
    };
  }

  const redeploy = await submitRedeploy(normalized, productionApproval.approvalPhrase);
  const redeployStatus = compactRedeployResult(redeploy);
  const redeployOk = redeployStatus.ok === true;
  const redeployBlocked = redeployStatus.blocked === true;
  await emitEvent({
    type: "step_done",
    step: "submit_redeploy",
    status: redeployOk ? "submitted" : redeployBlocked ? "blocked" : "failed",
    data: redeployStatus,
  });

  if (!redeployOk || redeployBlocked) {
    const receipt = await writeWorkflowReceipt({
      workflowId: normalized.workflowId,
      status: redeployBlocked ? "blocked" : "failed",
      summary: "Vercel redeploy bridge did not return an accepted deployment.",
      evidence: { readiness, redeploy },
      blocker: redeployError(redeploy) ?? "Redeploy bridge returned non-ok status.",
    });
    return {
      ok: false,
      status: redeployBlocked ? "blocked" : "failed",
      redeploy,
      receipt,
      nextActions: ["Inspect redeploy bridge response and retry after blockers are cleared."],
    };
  }

  const deploymentTarget = getDeploymentTarget(redeploy);
  if (!deploymentTarget) {
    const receipt = await writeWorkflowReceipt({
      workflowId: normalized.workflowId,
      status: "blocked",
      summary: "Redeploy bridge accepted the request but did not return a deployment id or URL.",
      evidence: { readiness, redeploy },
      blocker: "Missing deployment id or URL from Vercel response.",
    });
    return {
      ok: false,
      status: "blocked",
      redeploy,
      receipt,
      nextActions: ["Check Vercel deployments for the target project and correlate by commit/ref metadata."],
    };
  }

  let deployment = await readDeploymentStatus(deploymentTarget.idOrUrl);
  for (let poll = 1; poll <= normalized.maxPolls && !isTerminalDeploymentState(deployment.state); poll += 1) {
    await emitEvent({
      type: "deployment_poll",
      step: "poll_deployment",
      status: deployment.state ?? "unknown",
      data: { poll, maxPolls: normalized.maxPolls, pollIntervalMs: normalized.pollIntervalMs, deployment },
    });
    await sleep(normalized.pollIntervalMs);
    deployment = await readDeploymentStatus(deploymentTarget.idOrUrl);
  }

  await emitEvent({
    type: "step_done",
    step: "poll_deployment",
    status: deployment.state ?? "unknown",
    data: { deployment },
  });

  if (deployment.state !== "READY") {
    const receipt = await writeWorkflowReceipt({
      workflowId: normalized.workflowId,
      status: "failed",
      summary: "Preview deployment did not reach READY before workflow polling ended.",
      evidence: { readiness, redeploy, deployment },
      blocker: `Deployment state: ${deployment.state ?? "unknown"}`,
    });
    return {
      ok: false,
      status: "failed",
      redeploy,
      deployment,
      receipt,
      nextActions: ["Inspect Vercel build logs for the deployment and rerun the workflow after correction."],
    };
  }

  const deploymentUrl = deployment.deploymentUrl ?? deploymentTarget.deploymentUrl;
  const routeChecks = await verifyDeploymentRoutes(deploymentUrl, normalized.verifyRoutes);
  await emitEvent({
    type: "route_verification",
    step: "verify_routes",
    status: routeChecks.every((check) => check.ok) ? "passed" : "failed",
    data: { routeChecks },
  });

  const allRoutesOk = routeChecks.every((check) => check.ok);
  const receipt = await writeWorkflowReceipt({
    workflowId: normalized.workflowId,
    status: allRoutesOk ? "success" : "failed",
    summary: allRoutesOk
      ? "AUTO BUILDER handoff completed through Vercel Workflow."
      : "AUTO BUILDER handoff deployed but one or more route checks failed.",
    evidence: { readiness, redeploy, deployment, routeChecks },
    blocker: allRoutesOk ? null : "One or more route checks did not return a healthy response.",
  });

  await emitEvent({
    type: "receipt_written",
    step: "write_receipt",
    status: allRoutesOk ? "success" : "failed",
    data: { receipt },
  });

  await emitEvent({
    type: "done",
    step: "handoff_workflow",
    status: allRoutesOk ? "success" : "failed",
    data: { deploymentUrl, routeCount: routeChecks.length },
  });

  return {
    ok: allRoutesOk,
    status: allRoutesOk ? "success" : "failed",
    workflowId: normalized.workflowId,
    deploymentUrl,
    deployment,
    routeChecks,
    receipt,
    rollbackPath:
      normalized.deploymentMode === "production"
        ? "Promote or redeploy the prior known-good Vercel production deployment."
        : "Discard the preview and rerun from a prior known-good commit or branch.",
    nextActions: allRoutesOk
      ? ["Keep this as the Vercel Workflow handoff lane for future redeploy and verification passes."]
      : ["Fix failing routes, then rerun the workflow in preview mode."],
  };
}

function normalizeInput(input: AutoBuilderHandoffWorkflowInput): NormalizedInput {
  return {
    workflowId: input.workflowId ?? "auto-builder-handoff",
    targetSystem: input.targetSystem === "eden_skye_studios" ? "eden_skye_studios" : "auto_builder",
    mode: input.mode ?? "execute",
    deploymentMode: input.deploymentMode ?? "preview",
    ref: input.ref ?? "main",
    sha: input.sha,
    requestedBy: input.requestedBy ?? "AUTO BUILDER Vercel Workflow",
    verifyRoutes: input.verifyRoutes?.length ? input.verifyRoutes : DEFAULT_VERIFY_ROUTES,
    maxPolls: clamp(input.maxPolls ?? 30, 1, 120),
    pollIntervalMs: clamp(input.pollIntervalMs ?? parsePollIntervalMs(input.pollInterval) ?? 10000, 1000, 60000),
    approvedProductionDeploy: input.approvedProductionDeploy,
    approvalPhrase: input.approvalPhrase,
    metadata: input.metadata,
  };
}

function parsePollIntervalMs(value: string | undefined) {
  if (!value) return null;
  const match = value.match(/^(\d+)(ms|s|m)$/);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === "ms") return amount;
  if (unit === "s") return amount * 1000;
  return amount * 60_000;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function productionPhraseApproved(input: NormalizedInput) {
  return input.approvedProductionDeploy === true && input.approvalPhrase === "APPROVE PRODUCTION DEPLOY";
}

async function resolveProductionApproval(input: NormalizedInput) {
  if (productionPhraseApproved(input)) {
    return { approved: true, approvalPhrase: input.approvalPhrase, source: "input" };
  }

  const token = await createApprovalToken(input.workflowId);
  const hook = productionDeployApprovalHook.create({ token });
  await emitEvent({
    type: "awaiting_approval",
    step: "production_approval",
    status: "waiting",
    token,
    message: "Production deployment requires explicit approval before the workflow can continue.",
    nextActions: ["POST the token and approval phrase to the workflow approval route."],
  });

  const result = await Promise.race([
    hook.then((payload) => ({ type: "approval" as const, payload })),
    sleep("24h").then(() => ({ type: "timeout" as const, payload: null })),
  ]);

  if (result.type === "timeout") {
    await emitEvent({
      type: "approval_result",
      step: "production_approval",
      status: "timeout",
      message: "Production approval timed out.",
    });
    return { approved: false, approvalPhrase: undefined, source: "timeout" };
  }

  const approved = result.payload.approved === true && result.payload.approvalPhrase === "APPROVE PRODUCTION DEPLOY";
  await emitEvent({
    type: "approval_result",
    step: "production_approval",
    status: approved ? "approved" : "rejected",
    data: { approvedBy: result.payload.approvedBy ?? null, comment: result.payload.comment ?? null },
  });

  return {
    approved,
    approvalPhrase: approved ? result.payload.approvalPhrase : undefined,
    source: "hook",
  };
}

async function emitEvent(event: Omit<HandoffWorkflowEvent, "at">) {
  "use step";
  const writer = getWritable<HandoffWorkflowEvent>().getWriter();
  try {
    await writer.write({ ...event, at: new Date().toISOString() });
  } finally {
    writer.releaseLock();
  }
}

async function createApprovalToken(workflowId: string) {
  "use step";
  return `auto-builder-handoff:${workflowId}:${crypto.randomUUID()}`;
}

async function readRedeployReadiness() {
  "use step";
  return getVercelRedeployReadiness();
}

async function submitRedeploy(input: NormalizedInput, approvedApprovalPhrase?: string) {
  "use step";
  return triggerVercelRedeploy({
    targetSystem: input.targetSystem,
    mode: input.deploymentMode,
    ref: input.ref,
    sha: input.sha,
    requestedBy: input.requestedBy,
    approvedProductionDeploy: input.deploymentMode === "production" ? true : undefined,
    approvalPhrase: approvedApprovalPhrase ?? input.approvalPhrase,
    metadata: {
      source: "auto-builder-handoff-vercel-workflow",
      workflowId: input.workflowId,
      ...(input.metadata ?? {}),
    },
  });
}

function compactRedeployResult(result: RedeployResult): Record<string, unknown> {
  const record = result as Record<string, unknown>;
  return {
    ok: record.ok,
    blocked: record.blocked,
    status: record.status,
    targetSystem: record.targetSystem,
    mode: record.mode,
    deploymentUrl: record.deploymentUrl,
    error: record.error,
  };
}

function redeployError(result: RedeployResult) {
  return stringValue((result as Record<string, unknown>).error);
}

function getDeploymentTarget(result: RedeployResult) {
  const record = result as Record<string, unknown>;
  const data = isRecord(record.data) ? record.data : {};
  const id = stringValue(data.id);
  const url = stringValue(data.url);
  const deploymentUrl = stringValue(record.deploymentUrl) ?? (url ? `https://${url}` : null);
  const idOrUrl = id ?? url;
  if (!idOrUrl) return null;
  return { idOrUrl, deploymentUrl };
}

async function readDeploymentStatus(idOrUrl: string): Promise<DeploymentStatus> {
  "use step";

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return {
      ok: false,
      status: 503,
      state: null,
      readyState: null,
      deploymentUrl: null,
      id: null,
      error: "VERCEL_TOKEN is missing.",
    };
  }

  const url = new URL(`https://api.vercel.com/v13/deployments/${encodeURIComponent(idOrUrl)}`);
  if (process.env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  }

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await response.text();
  const data = parseJson(text);
  const record = isRecord(data) ? data : {};
  const host = stringValue(record.url);

  return {
    ok: response.ok,
    status: response.status,
    state: stringValue(record.state) ?? stringValue(record.readyState) ?? null,
    readyState: stringValue(record.readyState) ?? null,
    deploymentUrl: host ? `https://${host}` : null,
    id: stringValue(record.id) ?? null,
    error: response.ok ? undefined : text,
  };
}

function isTerminalDeploymentState(state: string | null) {
  return state === "READY" || state === "ERROR" || state === "CANCELED";
}

async function verifyDeploymentRoutes(deploymentUrl: string | null, routes: string[]) {
  "use step";

  if (!deploymentUrl) {
    return routes.map((route) => ({ route, ok: false, status: 0, error: "Missing deployment URL." }));
  }

  const checks = [];
  for (const route of routes) {
    const url = route.startsWith("http") ? route : new URL(route, deploymentUrl).toString();
    try {
      const response = await fetch(url, { cache: "no-store" });
      const text = await response.text();
      checks.push({
        route,
        url,
        ok: response.ok,
        status: response.status,
        matchedPath: response.headers.get("x-matched-path"),
        bodyPreview: text.slice(0, 600),
      });
    } catch (error) {
      checks.push({
        route,
        url,
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : "Unknown route verification error.",
      });
    }
  }
  return checks;
}

async function writeWorkflowReceipt(input: {
  workflowId: string;
  status: "planned" | "success" | "failed" | "blocked";
  summary: string;
  evidence: Record<string, unknown>;
  blocker: string | null;
}) {
  "use step";

  const receipt = {
    workflowId: input.workflowId,
    status: input.status,
    summary: input.summary,
    evidence: input.evidence,
    blocker: input.blocker,
    createdAt: new Date().toISOString(),
    protectedActionsBlocked: [
      "production deploy without approval phrase",
      "environment mutation",
      "Supabase production migration",
      "Drive write",
      "social publishing",
      "outbound message",
      "billing or spend",
      "destructive action",
    ],
  };

  const telemetry = await insertTelemetry("bridge_evidence", {
    worker: "vercel-workflow-handoff",
    status: input.status,
    evidence: JSON.stringify(receipt),
    blocker: input.blocker,
    created_at: receipt.createdAt,
  });

  return { ...receipt, telemetry };
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
