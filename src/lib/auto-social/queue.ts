import { assertSandboxGate, riskForOperation } from "./governance";
import { buildInitialQueue, enterpriseModules, modelRegistrySeed } from "./registry";
import { buildMemorySeed } from "./memory";
import { buildPostRunReflection, buildPreRunReflection } from "./reflection";
import type { AutoSocialOperation, AutoSocialReceipt } from "./types";

export function runAutoSocialOperation(operation: AutoSocialOperation, payload: unknown = {}) {
  const gate = assertSandboxGate(operation);
  const preRunReflection = buildPreRunReflection(operation);
  const ok = gate.gate !== "blocked";
  const receipt: AutoSocialReceipt = {
    id: `receipt-${operation}-${Date.now()}`,
    action: operation,
    ok,
    gate: gate.gate,
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    evidence: [
      "sandbox_branch=sandbox/eden-skye-enterprise-os",
      "live_actions=locked",
      `risk=${riskForOperation(operation)}`,
      `gate=${gate.gate}`
    ],
    nextActions:
      gate.gate === "owner_approval_required"
        ? ["Create approval record before any external dispatch.", "Keep item in draft queue."]
        : ["Write receipt.", "Advance next safe queue item."]
  };

  return {
    ok,
    operation,
    payload,
    gate,
    registry: {
      cohorts: modelRegistrySeed.length,
      targetAccounts: modelRegistrySeed.length * 20,
      models: modelRegistrySeed
    },
    modules: enterpriseModules,
    queue: buildInitialQueue(),
    memorySeed: buildMemorySeed(),
    preRunReflection,
    postRunReflection: buildPostRunReflection(operation, ok),
    receipt
  };
}

export function buildHeartbeatReceipt() {
  const operations: AutoSocialOperation[] = ["discover", "analyze", "create", "validate", "heal"];
  return {
    ok: true,
    job: "auto-social-five-minute",
    productionActionAllowed: false,
    timestamp: new Date().toISOString(),
    checks: operations.map((operation) => runAutoSocialOperation(operation).receipt),
    protected: [
      "live publishing",
      "outbound messages",
      "n8n dispatch",
      "credentialed browser actions",
      "production migrations"
    ]
  };
}
