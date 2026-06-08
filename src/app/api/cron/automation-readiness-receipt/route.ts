import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function present(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function statusFromChecks(checks: Record<string, boolean>) {
  return Object.values(checks).every(Boolean) ? "ready" : "blocked";
}

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json(
      { status: "blocked", reason: "Automation readiness receipt is disabled in production." },
      { status: 403 }
    );
  }

  const workerChecks = {
    execution_worker_enabled: process.env.AUTO_BUILDER_EXECUTION_WORKER_ENABLED === "true",
    worker_token_present: present(process.env.AUTO_BUILDER_WORKER_TOKEN)
  };

  const googleChecks = {
    access_token_present: present(process.env.GOOGLE_DRIVE_ACCESS_TOKEN) || present(process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN),
    service_account_email_present: present(process.env.GOOGLE_CLIENT_EMAIL) || present(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
    service_account_private_key_present: present(process.env.GOOGLE_PRIVATE_KEY) || present(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  };

  const googleAuthReady = googleChecks.access_token_present || (googleChecks.service_account_email_present && googleChecks.service_account_private_key_present);

  const n8nChecks = {
    server_url_present: present(process.env.N8N_SERVER_URL) || present(process.env.N8N_BASE_URL) || present(process.env.N8N_WEBHOOK_BASE_URL),
    access_token_present: present(process.env.N8N_ACCESS_TOKEN) || present(process.env.N8N_API_KEY)
  };

  const readiness = {
    worker: statusFromChecks(workerChecks),
    google_drive_auth: googleAuthReady ? "ready" : "blocked",
    n8n: statusFromChecks(n8nChecks)
  };

  const overallStatus = readiness.worker === "ready" && readiness.google_drive_auth === "ready" && readiness.n8n === "ready" ? "ready" : "blocked";

  return NextResponse.json({
    status: overallStatus,
    mode: "preview_readiness_only",
    mutation_performed: false,
    secrets_returned: false,
    checks: {
      worker: workerChecks,
      google_drive_auth: googleChecks,
      n8n: n8nChecks
    },
    readiness,
    next_safe_routes: [
      "/api/cron/drive-scaffold-dry-run",
      "/api/cron/automation-readiness-receipt"
    ],
    approval_gates: [
      "Drive approved_write requires explicit operator approval after dry-run PASS.",
      "n8n workflow creation, activation, or live trigger requires explicit operator approval after readiness PASS."
    ],
    timestamp: new Date().toISOString()
  });
}
