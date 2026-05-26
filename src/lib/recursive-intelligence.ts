import crypto from "node:crypto";

export function hashText(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export function compressMemory(history: string[]) {
  const joined = history.filter(Boolean).slice(0, 8).join(" | ");
  return joined.length > 360 ? `${joined.slice(0, 357)}...` : joined;
}

export function classifyBlocker(blocker: string) {
  const text = blocker.toLowerCase();
  if (text.includes("token") || text.includes("auth") || text.includes("permission")) {
    return { severity: "high", category: "access" };
  }
  if (text.includes("timeout") || text.includes("stale") || text.includes("scheduler")) {
    return { severity: "medium", category: "runtime" };
  }
  if (text.includes("none") || text.includes("success")) {
    return { severity: "low", category: "none" };
  }
  return { severity: "medium", category: "general" };
}

export function rankNextTask(input: {
  profitability: number;
  blockerReduction: number;
  capabilityGain: number;
  runtimeStability: number;
  telemetryHealth: number;
}) {
  const total =
    input.profitability * 0.3 +
    input.blockerReduction * 0.25 +
    input.capabilityGain * 0.2 +
    input.runtimeStability * 0.15 +
    input.telemetryHealth * 0.1;
  return Number(total.toFixed(2));
}
