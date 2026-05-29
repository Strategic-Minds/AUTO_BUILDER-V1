import { ProviderId, ProviderRiskClass } from './providerTypes';

export type ProviderTargetLabel = {
  id: string;
  label: string;
  provider: ProviderId | 'meta';
  network?: 'facebook' | 'instagram';
  verifiedLiveId: boolean;
  notes: string;
};

export type ProviderCatalogEntry = {
  id: ProviderId;
  label: string;
  status: 'connected' | 'runtime_env_required' | 'connector_unverified' | 'placeholder';
  safeDefaultRiskClass: ProviderRiskClass;
  allowedWithoutApproval: ProviderRiskClass[];
  blockedWithoutApproval: ProviderRiskClass[];
  supportedDraftTargets?: ProviderTargetLabel[];
};

export const providerTargets: ProviderTargetLabel[] = [
  {
    id: 'eden_skye_facebook',
    label: 'Eden Skye Facebook',
    provider: 'meta',
    network: 'facebook',
    verifiedLiveId: false,
    notes: 'Target label only until live Meta page/account ID is verified.'
  },
  {
    id: 'eden_skye_instagram',
    label: 'Eden Skye Instagram connected to Facebook',
    provider: 'meta',
    network: 'instagram',
    verifiedLiveId: false,
    notes: 'Target label only; Instagram is treated as connected to Facebook until live account ID is verified.'
  },
  {
    id: 'jeremy_bensen_personal_brand',
    label: 'Jeremy Bensen personal brand',
    provider: 'meta',
    network: 'facebook',
    verifiedLiveId: false,
    notes: 'Personal brand label only. Do not post to personal profile without explicit approval and verified provider support.'
  },
  {
    id: 'divergent_businessman',
    label: 'divergent.businessman',
    provider: 'meta',
    network: 'instagram',
    verifiedLiveId: false,
    notes: 'Handle label only. Do not publish until account ownership, permissions, and provider support are verified.'
  }
];

export const providerCatalog: ProviderCatalogEntry[] = [
  {
    id: 'google_drive',
    label: 'Google Drive / Docs / Sheets / Slides',
    status: 'connected',
    safeDefaultRiskClass: 'safe_draft',
    allowedWithoutApproval: ['safe_read', 'safe_draft'],
    blockedWithoutApproval: ['internal_write', 'external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation']
  },
  {
    id: 'google_calendar',
    label: 'Google Calendar',
    status: 'connected',
    safeDefaultRiskClass: 'safe_draft',
    allowedWithoutApproval: ['safe_read', 'safe_draft'],
    blockedWithoutApproval: ['internal_write', 'external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation']
  },
  {
    id: 'notion',
    label: 'Notion',
    status: 'connector_unverified',
    safeDefaultRiskClass: 'safe_draft',
    allowedWithoutApproval: ['safe_read', 'safe_draft'],
    blockedWithoutApproval: ['internal_write', 'external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation']
  },
  {
    id: 'klaviyo',
    label: 'Klaviyo',
    status: 'connector_unverified',
    safeDefaultRiskClass: 'safe_draft',
    allowedWithoutApproval: ['safe_read', 'safe_draft'],
    blockedWithoutApproval: ['internal_write', 'external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation']
  },
  {
    id: 'metricool',
    label: 'Metricool / Meta social planner',
    status: 'runtime_env_required',
    safeDefaultRiskClass: 'safe_draft',
    allowedWithoutApproval: ['safe_read', 'safe_draft'],
    blockedWithoutApproval: ['internal_write', 'external_write', 'public_publish', 'financial', 'destructive', 'authority_mutation'],
    supportedDraftTargets: providerTargets
  }
];

export function getProviderCatalog() {
  return providerCatalog;
}

export function getProviderTargets() {
  return providerTargets;
}

export function findProvider(id: ProviderId) {
  return providerCatalog.find((provider) => provider.id === id) ?? null;
}
