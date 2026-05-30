import type { ProviderBridgeAction, ProviderRiskClass } from './providerTypes';
import { requiresApproval } from './providerTypes';

export type ProviderWritePolicy = {
  readEnabled: boolean;
  writeEnabled: boolean;
  autonomousSafeWritesEnabled: boolean;
  approvalRequiredFor: ProviderRiskClass[];
  neverAutonomous: ProviderRiskClass[];
};

export const providerWritePolicy: ProviderWritePolicy = {
  readEnabled: true,
  writeEnabled: true,
  autonomousSafeWritesEnabled: true,
  approvalRequiredFor: ['external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation'],
  neverAutonomous: ['financial', 'destructive', 'authority_mutation']
};

export function evaluateProviderAction(action: ProviderBridgeAction) {
  const approvalNeeded = requiresApproval(action.riskClass) && action.approved !== true;
  const blocked = providerWritePolicy.neverAutonomous.includes(action.riskClass) && action.approved !== true;
  const autonomousWriteAllowed =
    providerWritePolicy.writeEnabled &&
    providerWritePolicy.autonomousSafeWritesEnabled &&
    !approvalNeeded &&
    !blocked;

  return {
    ok: !blocked && (!approvalNeeded || action.approved === true),
    readEnabled: providerWritePolicy.readEnabled,
    writeEnabled: providerWritePolicy.writeEnabled,
    autonomousWriteAllowed,
    approvalNeeded,
    blocked,
    riskClass: action.riskClass,
    reason: blocked
      ? `Risk class ${action.riskClass} is never autonomous without explicit approval.`
      : approvalNeeded
        ? `Risk class ${action.riskClass} requires explicit approval.`
        : 'Action allowed by provider write policy.'
  };
}
