import { agentContract, protectedGates, sandboxContract, workflowContract } from "@/lib/autobuilder/runtime-contracts";

export function buildAutobuilderGeneratorPlan(input: { idea?: string; source?: string; approvalState?: string } = {}) {
  const generatedAt = new Date().toISOString();
  return {
    ok: true,
    generatedAt,
    idea: input.idea || "unassigned_system_in_box",
    source: input.source || "api",
    approvalState: input.approvalState || "pending",
    mutation: false,
    builderBoundary: "Vercel is the build/execution layer. GPT/AUTO BUILDER creates packets, queues, validation, and receipts.",
    lockedFlow: ["PLAN", "DISCOVERY", "BRAND_OPTIONS", "APPROVAL", "DOCS", "SUBMIT_TO_VERCEL_BUILD", "VALIDATE", "RELEASE_OPERATE"],
    sourceTruth: ["GitHub/repo truth", "Google Drive/source docs", "autonomous GPT bridge receipts"],
    featureGroups: [
      "intake",
      "discovery",
      "brand_options",
      "builder_docs",
      "vercel_workflow",
      "vercel_sandbox",
      "vercel_agents",
      "ai_gateway",
      "codex_jobs",
      "n8n_bridge",
      "google_chat_approvals",
      "auto_social",
      "browser_evidence",
      "release_handoff"
    ],
    workflow: workflowContract(),
    sandbox: sandboxContract(),
    agents: agentContract(),
    requiredOutputs: [
      "00_START_HERE.md",
      "builder-docs packet",
      "vercel-build-packet.json",
      "workflow handoff",
      "smoke evidence receipt",
      "rollback plan"
    ],
    protectedGates,
    nextSafeAction: "queue_preview_or_dry_run_only"
  };
}
