import type { MediaDriveActionClass, MediaDriveToolName } from './types';

export type MediaDriveGovernanceInput = {
  tool: MediaDriveToolName | string;
  source_folder_path?: string;
  target_folder_path?: string;
  public_share?: boolean;
  permission_change?: boolean;
  delete_action?: boolean;
  overwrite_existing?: boolean;
  spend_cents?: number;
  budget_cents?: number;
  external_send?: boolean;
  contains_secret?: boolean;
};

export const PROTECTED_PATHS = [
  '00 Source Truth',
  '05 Client Delivery',
  '06 Governance/Legal',
  '06 Governance/Security'
];

export function detectMediaDriveHardGate(input: MediaDriveGovernanceInput): string[] {
  const reasons: string[] = [];

  if (input.public_share) reasons.push('public_share');
  if (input.permission_change) reasons.push('permission_change');
  if (input.delete_action) reasons.push('delete');
  if (input.external_send) reasons.push('external_send');
  if (input.contains_secret) reasons.push('secret_exposure');

  if (typeof input.spend_cents === 'number' && typeof input.budget_cents === 'number' && input.spend_cents > input.budget_cents) {
    reasons.push('spend_over_budget');
  }

  const paths = [input.source_folder_path, input.target_folder_path].filter(Boolean) as string[];
  if (paths.some((path) => path.includes('00 Source Truth'))) reasons.push('source_truth_move');

  if (input.overwrite_existing && paths.some((path) => path.includes('05 Client Delivery'))) {
    reasons.push('client_delivery_overwrite');
  }

  return Array.from(new Set(reasons));
}

export function classifyMediaDriveAction(input: MediaDriveGovernanceInput): MediaDriveActionClass {
  if (detectMediaDriveHardGate(input).length > 0) return 'HARD_GATED';
  return 'LOGGED';
}

export function assertMediaDriveAllowed(input: MediaDriveGovernanceInput) {
  const reasons = detectMediaDriveHardGate(input);
  return {
    allowed: reasons.length === 0,
    actionClass: reasons.length === 0 ? 'LOGGED' as const : 'HARD_GATED' as const,
    reasons
  };
}
