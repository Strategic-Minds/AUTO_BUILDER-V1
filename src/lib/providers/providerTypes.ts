export type ProviderId = 'google_drive' | 'google_calendar' | 'klaviyo' | 'metricool';

export type ProviderRiskClass =
  | 'safe_read'
  | 'safe_draft'
  | 'internal_write'
  | 'external_write'
  | 'public_publish'
  | 'financial'
  | 'destructive'
  | 'authority_mutation';

export type ProviderActionState =
  | 'generated'
  | 'queued'
  | 'claimed'
  | 'running'
  | 'blocked'
  | 'needs_approval'
  | 'dry_run'
  | 'completed'
  | 'failed';

export type ProviderBridgeAction = {
  provider: ProviderId;
  action: string;
  riskClass: ProviderRiskClass;
  payload: Record<string, unknown>;
  approved?: boolean;
  source?: string;
};

export type ProviderBridgeResult = {
  ok: boolean;
  provider: ProviderId;
  action: string;
  state: ProviderActionState;
  riskClass: ProviderRiskClass;
  dryRun?: boolean;
  response?: unknown;
  error?: string;
};

export type ProviderAdapter = {
  id: ProviderId;
  label: string;
  connected: boolean;
  supportedActions: string[];
  execute: (action: ProviderBridgeAction) => Promise<ProviderBridgeResult>;
};

export function requiresApproval(riskClass: ProviderRiskClass) {
  return ['external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation'].includes(riskClass);
}
