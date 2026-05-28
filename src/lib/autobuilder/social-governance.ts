export type SocialGovernanceStatus = 'safe_packet' | 'approval_required' | 'blocked';

export function socialGovernancePreflight(input: {
  action: string;
  livePublish?: boolean;
  autoDm?: boolean;
  massEngage?: boolean;
  accountMutation?: boolean;
}) {
  if (input.autoDm || input.massEngage || input.accountMutation) {
    return { status: 'blocked' as const, reason: 'Protected social action blocked.' };
  }
  if (input.livePublish) {
    return { status: 'approval_required' as const, reason: 'Live publishing requires exact approval.' };
  }
  return { status: 'safe_packet' as const, reason: 'Packet-only social action.' };
}
