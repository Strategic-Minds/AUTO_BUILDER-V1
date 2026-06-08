import { createReceipt } from "@/lib/autobuilder-v2/receipts";
import { providerRegistry } from "@/lib/autobuilder-v2/provider-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const receipt = createReceipt({
    provider: "autobuilder_v2",
    action: "five_minute_capability_bus_tick",
    category: "operate",
    operation: "scheduled_runtime_check",
    requestedCapability: "Run AUTO BUILDER 2 five-minute workflow tick",
    authStatus: "not_required",
    executionMode: "api",
    status: "completed",
    logs: [
      "AUTO BUILDER 2 five-minute tick executed.",
      `Providers registered: ${providerRegistry.length}`,
      "This route is intended for Vercel cron/workflow scheduling."
    ],
    artifacts: ["provider-registry", "receipt"],
    nextActions: [
      "Attach provider auth checks.",
      "Attach pipeline queue processor.",
      "Attach validation agent dispatch."
    ]
  });

  return Response.json({
    ok: true,
    schedule: "*/5 * * * *",
    service: "autobuilder-v2-five-minute",
    receipt,
    providerCount: providerRegistry.length
  });
}
