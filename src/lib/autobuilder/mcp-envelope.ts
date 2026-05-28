export type McpToolStatus = 'ok' | 'blocked' | 'needs_human' | 'error';

export type McpEvidence = {
  verified: string[];
  inferred: string[];
  couldNotVerify: string[];
};

export type McpResponseEnvelope<T> = McpEvidence & {
  tool: string;
  status: McpToolStatus;
  phaseStep: string;
  timestamp: string;
  result: T;
  blockers: string[];
  workarounds: string[];
  selfHeal: string[];
  nextStep: string;
};

export function makeMcpEnvelope<T>(input: {
  tool: string;
  phaseStep: string;
  result: T;
  nextStep: string;
  status?: McpToolStatus;
  verified?: string[];
  inferred?: string[];
  couldNotVerify?: string[];
  blockers?: string[];
  workarounds?: string[];
  selfHeal?: string[];
}): McpResponseEnvelope<T> {
  return {
    tool: input.tool,
    status: input.status ?? 'ok',
    phaseStep: input.phaseStep,
    timestamp: new Date().toISOString(),
    result: input.result,
    verified: input.verified ?? [],
    inferred: input.inferred ?? [],
    couldNotVerify: input.couldNotVerify ?? [],
    blockers: input.blockers ?? [],
    workarounds: input.workarounds ?? [],
    selfHeal: input.selfHeal ?? [],
    nextStep: input.nextStep
  };
}
