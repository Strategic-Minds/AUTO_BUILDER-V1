import { NextRequest, NextResponse } from "next/server";
import { factoryReadiness } from "@/lib/factory";

const protectedGates = [
  "production_deploy",
  "production_database_migration",
  "secret_mutation",
  "commerce_payment_mutation",
  "live_social_publish",
  "customer_message",
  "destructive_action",
  "external_spend",
  "credentialed_browser_action"
];

const evidenceRequired = [
  "factory_intake_receipt",
  "generator_tick_receipt",
  "protected_policy_smoke_receipt",
  "supabase_dev_branch_hardening_receipt",
  "frontend_backend_sync_receipt",
  "auto_social_draft_only_receipt",
  "browser_screenshot_receipt",
  "final_hardening_receipt",
  "final_optimize_receipt"
];

const currentReceipts = [
  {
    id: "factory_intake_receipt",
    status: "verified",
    evidence: "GitHub Actions run 27084894752 artifact 7461435096 returned status=submitted, response.status=200, parsed.status=ok, and buildPacket present."
  }
];

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) {
    return true;
  }

  const header = request.headers.get("x-cron-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const completeReceipts = new Set(currentReceipts.filter((receipt) => receipt.status === "verified").map((receipt) => receipt.id));
  const missingReceipts = evidenceRequired.filter((receipt) => !completeReceipts.has(receipt));

  return NextResponse.json({
    ok: true,
    job: "master-completion-validator",
    mode: "non_mutating_finalization",
    productionActionAllowed: false,
    mutationExecuted: false,
    protectedActionsExecuted: false,
    timestamp: new Date().toISOString(),
    sourceTruth: [
      "docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md",
      "docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md",
      "factory/workflow-submissions/master-system-completion-vercel-workflow-20260607.json"
    ],
    factoryReadinessScore: factoryReadiness.factoryReadinessScore,
    receipts: {
      totalRequired: evidenceRequired.length,
      verified: currentReceipts,
      missing: missingReceipts,
      completeCount: completeReceipts.size,
      pendingCount: missingReceipts.length
    },
    protectedGates,
    nextAction: missingReceipts[0] ?? "release_hold_until_explicit_approval",
    releaseHold: true
  });
}
