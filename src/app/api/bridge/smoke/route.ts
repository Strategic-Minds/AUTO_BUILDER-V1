import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ready",
    mutation: false,
    smokeOrder: [
      { step: "heartbeat", status: "ready" },
      { step: "secret_names_only", status: "ready", route: "/api/bridge/env-names" },
      { step: "read_harmless_file", status: "ready", sample: "bridge-smoke-read-ok" },
      { step: "write_harmless_file", status: "simulated", reason: "serverless_filesystem_not_persistent" },
      { step: "execute_harmless_command", status: "ready", node: process.version },
      { step: "browser_screenshot", status: "external_worker_required" },
      { step: "git_status", status: "github_actions_or_local_relay_required" },
      { step: "connector_by_connector_widening", status: "ready_with_approval_gates" }
    ]
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    status: "completed",
    mutation: false,
    received: body,
    harmlessWriteReceipt: {
      receiptId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      target: "ephemeral_bridge_smoke",
      persisted: false
    },
    harmlessCommand: {
      node: process.version,
      runtime: process.env.NEXT_RUNTIME || "nodejs"
    }
  }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
