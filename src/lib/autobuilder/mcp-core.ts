export const AUTO_BUILDER_VERSION = "0.3.0";

export const PROTECTED_MUTATION_RULE =
  "No protected mutation without Jeremy explicit current-session command.";

export function autobuilderStackStatus() {
  return {
    status: "ok",
    version: AUTO_BUILDER_VERSION,
    stack: [
      "Google Workspace",
      "Drive",
      "Sheets",
      "Shopify",
      "Stripe",
      "Repurpose.io",
      "Xyla",
      "Facebook",
      "Instagram",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "Reddit",
      "GitHub",
      "Vercel",
      "Supabase",
      "OpenAI",
      "MCP",
      "REST Actions",
      "Webhooks"
    ],
    governance: PROTECTED_MUTATION_RULE,
    closedLoop:
      "GPT -> bridge -> apps -> telemetry -> recursive optimization"
  };
}

export function governancePreflight(input: Record<string, unknown>) {
  const mutation = input.mutationRequested === true;
  const explicit = input.currentSessionExplicitCommand === true;
  const blocked = mutation && !explicit;

  return {
    action: input.action || "unspecified",
    targetSystem: input.targetSystem || "unknown",
    classification: blocked
      ? "BLOCKED_OR_REQUIRES_HUMAN"
      : "SAFE_OR_AUTHORIZED",
    humanNeeded: blocked,
    nextStep: blocked
      ? "Stop and request exact approval."
      : "Continue governed execution."
  };
}

export function createRepurposeTaskPacket(input: Record<string, unknown>) {
  return {
    status: "TASK_PACKET_CREATED_NOT_EXECUTED",
    sourceVideoUrl: input.sourceVideoUrl || null,
    campaignName: input.campaignName || "Untitled Campaign",
    targetPlatforms: input.targetPlatforms || ["Facebook"],
    postsPerDay: input.postsPerDay || 3,
    handoff: [
      "Drive intake",
      "Repurpose.io",
      "Drive output",
      "Xyla/Facebook",
      "Shopify/Stripe attribution"
    ],
    governance: "No publish or money movement performed."
  };
}

export function recursivePromptChainNext(input: Record<string, unknown>) {
  const text = String(input.lastResponse || "");
  const match = text.match(
    /NEXT GPT INSTRUCTION:\s*```(?:text)?\s*([\s\S]*?)```/i
  );

  return {
    status: match
      ? "EXTRACTED_NEXT_INSTRUCTION"
      : "GENERATED_FALLBACK_NEXT_INSTRUCTION",
    nextInstruction:
      match?.[1]?.trim() ||
      "PHASE-NEXT / STEP-1 : Rehydrate AUTO BUILDER continuity, verify state, preserve governance, and continue.",
    governance: "This tool cannot authorize protected mutation."
  };
}

export function bridgeRegistry() {
  return {
    apiTargets: ["Shopify", "Stripe", "Supabase", "GitHub", "Vercel"],
    workspaceTargets: ["Google Drive", "Google Sheets", "Gmail"],
    contentTargets: [
      "Repurpose.io",
      "Xyla",
      "Facebook",
      "Instagram",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "Reddit"
    ],
    automationFallbacks: ["Zapier", "Make", "n8n"],
    browserFallbacks: ["Browser automation when no API exists"],
    rule: "Use strongest safe bridge available."
  };
}

export function genericHttpBridgePlan(input: Record<string, unknown>) {
  return {
    status: "PLAN_ONLY_NOT_EXECUTED",
    targetUrl: input.targetUrl || null,
    method: input.method || "GET",
    safety: "Does not call external URLs yet."
  };
}

export function webhookIntake(input: Record<string, unknown>) {
  return {
    status: "WEBHOOK_RECEIVED",
    receivedAt: new Date().toISOString(),
    source: input.source || "unknown",
    eventType: input.eventType || "unknown",
    payloadKeys: Object.keys(input),
    governance: "Data intake only."
  };
}
