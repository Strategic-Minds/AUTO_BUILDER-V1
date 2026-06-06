import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { classifyBridgeAction, type ApprovalState, type RiskClass } from "@/lib/bridges/governance";
import { insertTelemetry, telemetryStoreStatus } from "@/lib/telemetry-store";

export const dynamic = "force-dynamic";

const SAFE_TASK_TYPES = new Set(["repo_inspection", "code_patch", "build_validation", "playwright_validation", "telemetry_check"]);

type CommandBody = {
  taskType?: string;
  taskPrompt?: string;
  priority?: string;
  approved?: boolean;
  source?: "gpt" | "v0" | "phone" | "workflow" | "local_relay" | string;
  bridgeId?: string;
  operation?: string;
  target?: string;
  payload?: Record<string, unknown>;
  riskClass?: RiskClass;
  mutation?: boolean;
  approvalState?: ApprovalState;
  approvalId?: string;
  dryRun?: boolean;
};

function authorized(request: Request) {
  const token = process.env.AUTO_BUILDER_BRIDGE_TOKEN || process.env.ADMIN_API_TOKEN || process.env.BRIDGE_API_KEY;
  if (!token) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${token}`;
}

function adminEnabled() {
  return process.env.AUTO_BUILDER_ADMIN_WRITE_ENABLED === "true";
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    mutation: false,
    source: "governed_frontend_command_bridge",
    currentState: "bidirectional_route_installed_persistence_gated",
    acceptsFrom: ["gpt", "v0", "phone", "workflow", "local_relay"],
    auth: {
      bearerRequiredForPost: true,
      configured: Boolean(process.env.AUTO_BUILDER_BRIDGE_TOKEN || process.env.ADMIN_API_TOKEN || process.env.BRIDGE_API_KEY)
    },
    persistence: {
      telemetry: telemetryStoreStatus(),
      enabled: adminEnabled(),
      rule: "POST defaults to dry-run receipt. Persistent queue writes require dryRun=false and AUTO_BUILDER_ADMIN_WRITE_ENABLED=true."
    },
    policy: {
      readAndDryRun: "allowed_with_token_and_receipt",
      mutation: "requires_policy_allowance_plus_approval_for_risk_class_2_plus",
      productionExternalMutation: "approval_gated"
    }
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ status: "blocked", mutation: false, reason: "bridge_bearer_token_required" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as CommandBody;
  const taskType = body.taskType ?? "repo_inspection";
  const legacySafe = SAFE_TASK_TYPES.has(taskType);
  const operation = body.operation || taskType;
  const target = body.target || "AUTO_BUILDER";
  const bridgeId = body.bridgeId || "frontend_control_bridge";
  const riskClass = body.riskClass ?? (body.mutation ? 2 : 0);
  const mutation = Boolean(body.mutation);
  const dryRun = body.dryRun !== false;
  const approvalState = body.approvalState || (body.approved ? "approved" : "not_required");

  const policy = classifyBridgeAction({
    riskClass,
    mutation,
    system: bridgeId.replace(/_bridge$/, ""),
    approvalState
  });

  const blockedReason = !legacySafe
    ? `Task type ${taskType} is not sandbox-safe.`
    : !policy.allowed
      ? policy.reason
      : riskClass >= 2 && !body.approvalId
        ? "approval_id_required_for_risk_class_2_plus"
        : null;

  const receipt = {
    receipt_id: `bridge-command-${randomUUID()}`,
    generated_at: new Date().toISOString(),
    actor: body.source || "gpt",
    bridge_id: bridgeId,
    operation,
    task_type: taskType,
    risk_class: riskClass,
    mutation,
    approval_state: approvalState,
    approval_id: body.approvalId || null,
    target,
    safe: legacySafe,
    blocked_reason: blockedReason,
    result: blockedReason ? "blocked" : dryRun ? "accepted_dry_run" : "accepted_for_queue",
    next_action: blockedReason ? "fix_policy_or_approval" : dryRun ? "inspect_receipt_or_resubmit_with_dryRun_false" : "process_from_queue"
  };

  if (blockedReason) {
    return NextResponse.json({ status: "blocked", mutation: false, policy, receipt }, { status: 403 });
  }

  const shouldPersist = !dryRun && adminEnabled();
  const commandInsert = shouldPersist ? await insertTelemetry("bridge_commands", {
    source: body.source ?? "gpt-autobuilder",
    task_type: taskType,
    task_prompt: body.taskPrompt ?? operation,
    target,
    priority: body.priority ?? "normal",
    approved: approvalState === "approved",
    safe: legacySafe,
    blocked_reason: null,
    created_at: receipt.generated_at
  }) : { ok: false, mode: "dry_run", reason: "dry_run_or_admin_write_disabled" };

  const taskInsert = shouldPersist ? await insertTelemetry("bridge_tasks", {
    command_ref: (commandInsert as any).response?.[0]?.id ?? null,
    task_type: taskType,
    task_prompt: body.taskPrompt ?? operation,
    target,
    priority: body.priority ?? "normal",
    state: "queued",
    approved: approvalState === "approved",
    safe: legacySafe,
    created_at: receipt.generated_at
  }) : { ok: false, mode: "dry_run", reason: "dry_run_or_admin_write_disabled" };

  return NextResponse.json({
    status: shouldPersist ? "queued" : "accepted_not_persisted",
    mutation: shouldPersist,
    persistence: shouldPersist ? "supabase_telemetry" : "dry_run_or_admin_write_disabled",
    policy,
    receipt,
    command: commandInsert,
    task: taskInsert
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
