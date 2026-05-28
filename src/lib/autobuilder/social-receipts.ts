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
