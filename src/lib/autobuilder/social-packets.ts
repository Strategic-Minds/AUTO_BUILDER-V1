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
