import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCheck = {
  route: string;
  ok: boolean;
  httpStatus?: number;
  response?: Record<string, unknown>;
  error?: string;
};

const expectedTools = [
  "health_check",
  "get_repo_summary",
  "list_repo_files",
  "read_bootstrap_status",
  "read_text_file",
  "run_job",
  "run_universal_job",
  "run_drive_job",
  "drive_list_tree",
  "drive_create_folder",
  "drive_move_folder",
  "drive_move_file",
  "drive_write_receipt",
  "run_platform_provisioning_job",
  "create_github_repo",
  "create_vercel_project",
  "create_vercel_workflow",
  "create_vercel_agent",
  "create_ai_gateway",
  "rollback"
];

const exposedTools = [
  "health_check",
  "get_repo_summary",
  "list_repo_files",
  "read_bootstrap_status",
  "read_text_file",
  "run_universal_job"
];

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

async function postJson(origin: string, route: string, body: Record<string, unknown>): Promise<RouteCheck> {
  try {
    const response = await fetch(`${origin}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });
    const json = await response.json().catch(() => ({}));
    return {
      route,
      ok: response.ok,
      httpStatus: response.status,
      response: json && typeof json === "object" ? json as Record<string, unknown> : { body: json }
    };
  } catch (error) {
    return {
      route,
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error"
    };
  }
}

function receiptKeyFrom(check: RouteCheck) {
  const persistence = check.response?.persistence;
  if (!persistence || typeof persistence !== "object") return "";
  const receipt = (persistence as { receipt?: { id?: unknown } }).receipt;
  return typeof receipt?.id === "string" ? receipt.id : "";
}

async function findReceipt(telemetryKey: string) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) {
    return {
      ok: false,
      status: "blocked_missing_cloud_receipt_store",
      reason: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for cloud preview validation."
    };
  }

  const endpoint = new URL(`${url}/rest/v1/runtime_telemetry_events`);
  endpoint.searchParams.set("select", "telemetry_key,event_status,created_at,event_payload");
  endpoint.searchParams.set("telemetry_key", `eq.${telemetryKey}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      accept: "application/json"
    },
    cache: "no-store"
  });

  const rows = await response.json().catch(() => []);
  return {
    ok: response.ok && Array.isArray(rows) && rows.length === 1,
    status: response.ok ? "receipt_lookup_completed" : "receipt_lookup_failed",
    httpStatus: response.status,
    telemetry_key: telemetryKey,
    rows
  };
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        status: "blocked_in_production",
        reason: "Preview validation route is disabled in production to prevent validation-triggered telemetry writes.",
        cloudOnly: true,
        noLocalFallback: true
      },
      { status: 403 }
    );
  }

  const origin = request.nextUrl.origin;
  const validationRunId = `preview-validation-${new Date().toISOString()}-${crypto.randomUUID()}`;
  const basePayload = {
    expectedTools,
    exposedTools,
    runtime: "vercel-preview",
    source: "cloud-preview-validation",
    validationRunId
  };

  const statusCheck = await postJson(origin, "/api/mcp-exposure/status", basePayload);
  const statusTelemetryKey = receiptKeyFrom(statusCheck);
  const statusReceiptLookup = statusTelemetryKey
    ? await findReceipt(statusTelemetryKey)
    : { ok: false, status: "missing_status_telemetry_key" };

  const fallbackCheck = await postJson(origin, "/api/mcp-exposure/fallback-job", {
    ...basePayload,
    title: "Preview validation fallback receipt"
  });

  const autoHealCheck = await postJson(origin, "/api/mcp-exposure/auto-heal", basePayload);

  const universalJobCheck = await postJson(origin, "/api/universal-job", {
    ...basePayload,
    jobType: "create_auto_heal_plan",
    riskClass: 1,
    mutation: false,
    system: "cloud_control_plane"
  });

  const routeChecks = [statusCheck, fallbackCheck, autoHealCheck, universalJobCheck];
  const allRoutesOk = routeChecks.every((check) => check.ok);
  const statusPersistence = statusCheck.response?.persistence as { ok?: unknown; status?: unknown } | undefined;
  const supabaseReceiptConfirmed = Boolean(statusReceiptLookup.ok);

  const result = {
    ok: allRoutesOk && statusPersistence?.ok === true && supabaseReceiptConfirmed,
    validationRunId,
    origin,
    statusTelemetryKey,
    statusPersistence: {
      ok: statusPersistence?.ok,
      status: statusPersistence?.status
    },
    supabaseReceiptConfirmed,
    statusReceiptLookup,
    routeChecks,
    productionApprovalReady: allRoutesOk && statusPersistence?.ok === true && supabaseReceiptConfirmed,
    cloudOnly: true,
    noLocalFallback: true
  };

  return NextResponse.json(result, { status: result.ok ? 200 : 424 });
}
