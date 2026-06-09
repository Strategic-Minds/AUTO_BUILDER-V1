import { NextRequest, NextResponse } from "next/server";
import { createMcpUniverseReceipt, recordMcpUniverseReceipt } from "@/lib/autobuilder-v2/mcp-universe/receipts";

export const runtime = "nodejs";

type SupabaseMode = "dry_run" | "read" | "approved_execute" | "approved_migration" | "approved_branch_admin";

type SupabaseJobInput = {
  mode?: SupabaseMode;
  tool?: string;
  approved?: boolean;
  approvalId?: string;
  projectId?: string;
  branchId?: string;
  migrationName?: string;
  sql?: string;
  advisorType?: "security" | "performance";
  targetEnvironment?: "preview" | "dev" | "production";
  idempotencyKey?: string;
};

const supabaseTools = [
  "run_supabase_job",
  "supabase_list_projects",
  "supabase_list_branches",
  "supabase_list_migrations",
  "supabase_execute_sql",
  "supabase_apply_migration",
  "supabase_rebase_branch",
  "supabase_reset_branch",
  "supabase_merge_branch",
  "supabase_get_advisors",
  "supabase_write_receipt"
] as const;

const writeTools = new Set([
  "supabase_execute_sql",
  "supabase_apply_migration",
  "supabase_rebase_branch",
  "supabase_reset_branch",
  "supabase_merge_branch"
]);

function approvalMissing(input: SupabaseJobInput) {
  return input.approved !== true || typeof input.approvalId !== "string" || input.approvalId.length < 4;
}

function envReady() {
  return Boolean(process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function validateSupabaseJob(input: SupabaseJobInput) {
  const tool = input.tool ?? "run_supabase_job";
  const mode = input.mode ?? "dry_run";
  const missing: string[] = [];

  if (!supabaseTools.includes(tool as (typeof supabaseTools)[number])) missing.push("known Supabase tool");
  if (tool !== "supabase_list_projects" && !input.projectId) missing.push("projectId");
  if (["supabase_execute_sql", "supabase_apply_migration"].includes(tool) && !input.sql) missing.push("sql");
  if (tool === "supabase_apply_migration" && !input.migrationName) missing.push("migrationName");
  if (["supabase_rebase_branch", "supabase_reset_branch", "supabase_merge_branch"].includes(tool) && !input.branchId) missing.push("branchId");
  if (tool === "supabase_get_advisors" && !input.advisorType) missing.push("advisorType");

  const isWrite = writeTools.has(tool);
  const isDryRun = mode === "dry_run";
  const approvedMode = mode === "approved_execute" || mode === "approved_migration" || mode === "approved_branch_admin";
  const blockedByApproval = isWrite && !isDryRun && (approvalMissing(input) || !approvedMode);
  const liveExecutionDisabled = isWrite && !isDryRun && !process.env.WAVE2_SUPABASE_APPROVED_EXECUTE_ENABLED;
  const productionBlocked = isWrite && !isDryRun && input.targetEnvironment === "production" && !process.env.WAVE2_SUPABASE_PRODUCTION_APPROVED_ENABLED;

  return { tool, mode, missing, isWrite, blockedByApproval, liveExecutionDisabled, productionBlocked };
}

async function runSupabaseAdapter(input: SupabaseJobInput) {
  const { tool, mode, missing, isWrite, blockedByApproval, liveExecutionDisabled, productionBlocked } = validateSupabaseJob(input);
  const blocked = missing.length > 0 || blockedByApproval || liveExecutionDisabled || productionBlocked;
  const status = blocked ? "blocked" : mode === "dry_run" ? "dry_run_pass" : isWrite ? "approved_execution_ready" : "read_ready";
  const blocker = missing.length > 0
    ? `Missing required fields: ${missing.join(", ")}`
    : blockedByApproval
      ? "Write/migration/branch action requested without approved=true, approvalId, and approved mode."
      : liveExecutionDisabled
        ? "Supabase execute/migration/branch writes remain disabled until WAVE2_SUPABASE_APPROVED_EXECUTE_ENABLED is configured."
        : productionBlocked
          ? "Production Supabase actions require WAVE2_SUPABASE_PRODUCTION_APPROVED_ENABLED plus explicit operator approval."
          : null;

  const receipt = createMcpUniverseReceipt({
    mcpId: "wave-2-supabase-adapter",
    category: "system",
    action: `${tool}_${mode}`,
    autonomyLevel: isWrite ? 4 : 2,
    riskClass: isWrite ? "high" : "low",
    approvalState: blocked ? "blocked" : isWrite ? "approved" : "not_required",
    target: "/api/mcp-universe/wave-2/supabase",
    resultSummary: blocked
      ? "Supabase Wave 2 request blocked before database mutation."
      : isWrite
        ? "Supabase Wave 2 payload validated; dry-run performs no database mutation and approved execution must use the native Supabase MCP."
        : "Supabase Wave 2 read/dry-run payload validated.",
    validationStatus: blocked ? "blocked" : "passed",
    rollbackRef: input.idempotencyKey ?? null,
    nextAction: blocked ? "Fix blocker, then rerun dry-run." : "Route execution through native Supabase MCP and record receipt.",
    inputs: { ...input, sql: input.sql ? "redacted_sql_present" : null, secretValues: "redacted" }
  });

  const recorded = await recordMcpUniverseReceipt(receipt);

  return {
    ok: !blocked,
    productionActionAllowed: false,
    status,
    tool,
    mode,
    blocker,
    receiptId: receipt.receiptId,
    result: {
      envReady: envReady(),
      targetEnvironment: input.targetEnvironment ?? "preview",
      projectId: input.projectId ?? null,
      branchId: input.branchId ?? null,
      migrationName: input.migrationName ?? null,
      advisorType: input.advisorType ?? null,
      sqlReceived: Boolean(input.sql),
      databaseMutationPerformedByThisRoute: false,
      nativeSupabaseMcpRequiredForExecution: true,
      protectedActions: [
        "production migration",
        "raw SQL write",
        "branch reset",
        "branch merge",
        "destructive DDL",
        "data deletion"
      ]
    },
    recorded
  };
}

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get("dryRun");
  const approvalProbe = request.nextUrl.searchParams.get("approvalProbe");

  if (dryRun === "sample") {
    const result = await runSupabaseAdapter({
      mode: "dry_run",
      tool: "supabase_apply_migration",
      projectId: "preview-project-ref",
      migrationName: "eden_skye_operating_system_preview",
      sql: "create table if not exists public.example_preview_only(id uuid primary key);",
      targetEnvironment: "preview",
      idempotencyKey: "eden-skye-wave2-supabase-get-dry-run"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (approvalProbe === "1") {
    const result = await runSupabaseAdapter({
      mode: "approved_migration",
      tool: "supabase_apply_migration",
      projectId: "preview-project-ref",
      migrationName: "approval_probe",
      sql: "select 1;",
      targetEnvironment: "preview"
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    tools: supabaseTools,
    mode: "dry_run_ready",
    envReady: envReady(),
    sampleDryRun: "/api/mcp-universe/wave-2/supabase?dryRun=sample",
    approvalProbe: "/api/mcp-universe/wave-2/supabase?approvalProbe=1",
    note: "This route exposes governed Supabase adapter capability discovery and approval validation. Actual database reads/writes/migrations must execute through the native Supabase MCP connector with receipts."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, productionActionAllowed: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await runSupabaseAdapter(body as SupabaseJobInput);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
