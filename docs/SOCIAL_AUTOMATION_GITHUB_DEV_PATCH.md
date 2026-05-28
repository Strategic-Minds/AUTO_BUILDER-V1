# SOCIAL AUTOMATION GITHUB.DEV PATCH PACKAGE

## Goal
Install packet-only social automation helpers and schedule the social control route when manual patching is needed.

## Manual vercel.json patch
Add this cron entry to the crons array after /api/cron/recursive-control:

```json
{
  "path": "/api/cron/social-control",
  "schedule": "*/5 * * * *"
}
```

## Helper files to create
1. src/lib/autobuilder/social-packets.ts
2. src/lib/autobuilder/social-governance.ts
3. src/lib/autobuilder/social-receipts.ts
4. src/lib/autobuilder/social-status.ts

## Safety rules
1. Packet-only.
2. Receipt-only.
3. No live publish.
4. No auto DM.
5. No mass engagement.
6. No account setting changes.
7. Publish requires exact approval and connector validation.

## social-packets.ts
```ts
export type SocialPillar = 'authority' | 'proof' | 'cta';

export type SocialPacket = {
  platform: string;
  pillar: SocialPillar;
  hook: string;
  caption: string;
  cta: string;
  visual: string;
  approvalStatus: 'review_required';
  livePublished: false;
};

export function createSocialPostPacket(input: {
  platform?: string;
  pillar: SocialPillar;
  hook: string;
  caption: string;
  cta: string;
  visual: string;
}): SocialPacket {
  return {
    platform: input.platform ?? 'facebook',
    pillar: input.pillar,
    hook: input.hook,
    caption: input.caption,
    cta: input.cta,
    visual: input.visual,
    approvalStatus: 'review_required',
    livePublished: false
  };
}
```

## social-governance.ts
```ts
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
```

## social-receipts.ts
```ts
export type SocialReceipt = {
  receiptId: string;
  platform: string;
  status: string;
  postUrl?: string;
  publishedAt?: string;
  notes?: string;
};

export function createSocialReceipt(input: Omit<SocialReceipt, 'receiptId'>): SocialReceipt {
  return {
    receiptId: `social-${Date.now()}`,
    ...input
  };
}
```

## social-status.ts
```ts
export function getSocialContentQueueStatus() {
  return {
    queue: 'social_content_queue',
    status: 'packet_mode',
    livePublishingEnabled: false,
    autoEngagementEnabled: false,
    nextStep: 'Validate connector publishing path and receipt capture.'
  };
}
```

## Commit message
Install governed packet-only social helper layer
