import type { RuntimeResult, VercelRedeployInput, VercelRedeployOutput } from '../types';
import { APPROVAL_PHRASES } from '../governance';
import { runRuntimeJob } from '../orchestrator';

export interface VercelAdapterReadiness {
  ok: boolean;
  mode: 'dry_run';
  missingEnv: string[];
  requiredEnv: string[];
  protectedActions: string[];
}

export function getVercelRedeployReadiness(): VercelAdapterReadiness {
  const requiredEnv = ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID'];
  const optionalEnv = ['VERCEL_TEAM_ID'];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  return {
    ok: missingEnv.length === 0,
    mode: 'dry_run',
    missingEnv,
    requiredEnv: [...requiredEnv, ...optionalEnv],
    protectedActions: ['production deploy', 'production redeploy', 'environment mutation'],
  };
}

export async function planVercelRedeploy(
  input: VercelRedeployInput,
): Promise<RuntimeResult<VercelRedeployOutput>> {
  const readiness = getVercelRedeployReadiness();
  const isProduction = input.target === 'production';
  const mode = isProduction ? 'approved_write' : 'dry_run';

  return runRuntimeJob<VercelRedeployInput, VercelRedeployOutput>({
    type: 'vercel_redeploy_project',
    provider: 'vercel',
    action: isProduction ? 'production_redeploy' : 'preview_redeploy',
    mode,
    approvalPhrase: input.approvalPhrase,
    payload: input,
    evidence: [
      {
        type: 'json',
        label: 'vercel_adapter_readiness',
        value: readiness,
        collectedAt: new Date().toISOString(),
      },
    ],
  });
}

export async function executeVercelRedeployDisabled(
  _input: VercelRedeployInput,
): Promise<VercelRedeployOutput> {
  throw new Error(
    `Live Vercel redeploy is disabled until the adapter is explicitly wired and approved with ${APPROVAL_PHRASES.productionDeploy}.`,
  );
}
