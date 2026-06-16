import type { RuntimeMode, RuntimeRisk, RuntimeApproval, RuntimeProvider } from './types';

export const APPROVAL_PHRASES = {
  productionDeploy: 'APPROVE PRODUCTION DEPLOY',
  runtimeExecute: 'APPROVE RUNTIME EXECUTE',
  socialPublish: 'APPROVE SOCIAL PUBLISH',
  socialEngage: 'APPROVE SOCIAL ENGAGE',
  gmailSend: 'APPROVE GMAIL SEND',
  driveWrite: 'APPROVE DRIVE WRITE',
  supabaseWrite: 'APPROVE SUPABASE WRITE',
} as const;

const protectedProviders = new Set<RuntimeProvider>(['vercel', 'social', 'gmail', 'drive', 'workspace']);

export interface GovernanceDecision {
  allowed: boolean;
  risk: RuntimeRisk;
  requiredApproval?: string;
  blockers: string[];
}

export interface GovernanceInput {
  provider: RuntimeProvider;
  mode: RuntimeMode;
  action: string;
  approval?: RuntimeApproval;
  approvalPhrase?: string;
}

export function evaluateRuntimeGovernance(input: GovernanceInput): GovernanceDecision {
  const blockers: string[] = [];

  if (input.mode === 'dry_run' || input.mode === 'queue_only') {
    return { allowed: true, risk: 'low', blockers };
  }

  const externalWrite = protectedProviders.has(input.provider);
  const socialWrite = input.provider === 'social' && /(post|publish|comment|reply|message|dm)/i.test(input.action);
  const productionDeploy = input.provider === 'vercel' && /production|redeploy|deploy/i.test(input.action);

  let requiredApproval: string | undefined;

  if (productionDeploy) requiredApproval = APPROVAL_PHRASES.productionDeploy;
  else if (socialWrite) requiredApproval = APPROVAL_PHRASES.socialEngage;
  else if (input.provider === 'gmail' && /(send|forward)/i.test(input.action)) requiredApproval = APPROVAL_PHRASES.gmailSend;
  else if (input.provider === 'drive' || input.provider === 'workspace') requiredApproval = APPROVAL_PHRASES.driveWrite;
  else if (externalWrite) requiredApproval = APPROVAL_PHRASES.runtimeExecute;

  if (requiredApproval && input.approvalPhrase !== requiredApproval) {
    blockers.push(`Approval phrase required: ${requiredApproval}`);
    return { allowed: false, risk: 'blocked', requiredApproval, blockers };
  }

  return {
    allowed: true,
    risk: requiredApproval ? 'high' : 'medium',
    requiredApproval,
    blockers,
  };
}

export function assertRuntimeAllowed(input: GovernanceInput): GovernanceDecision {
  const decision = evaluateRuntimeGovernance(input);
  if (!decision.allowed) return decision;
  return decision;
}
