export type AutoBuilderBlockerClass =
  | "DONE"
  | "BLOCKED_BY_AUTH"
  | "BLOCKED_BY_PROVIDER"
  | "BLOCKED_BY_BUILD"
  | "BLOCKED_BY_CONFIG"
  | "BLOCKED_BY_OPERATOR_POLICY"
  | "BLOCKED_BY_UNKNOWN";

export function classifyBlocker(input: { missingAuth?: boolean; providerUnsupported?: boolean; buildFailed?: boolean; missingConfig?: boolean; policyBlocked?: boolean; done?: boolean; }): AutoBuilderBlockerClass {
  if (input.done) return "DONE";
  if (input.missingAuth) return "BLOCKED_BY_AUTH";
  if (input.providerUnsupported) return "BLOCKED_BY_PROVIDER";
  if (input.buildFailed) return "BLOCKED_BY_BUILD";
  if (input.missingConfig) return "BLOCKED_BY_CONFIG";
  if (input.policyBlocked) return "BLOCKED_BY_OPERATOR_POLICY";
  return "BLOCKED_BY_UNKNOWN";
}

export const finalStates: AutoBuilderBlockerClass[] = [
  "DONE",
  "BLOCKED_BY_AUTH",
  "BLOCKED_BY_PROVIDER",
  "BLOCKED_BY_BUILD",
  "BLOCKED_BY_CONFIG",
  "BLOCKED_BY_OPERATOR_POLICY"
];
