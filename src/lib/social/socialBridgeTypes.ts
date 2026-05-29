export type SocialNetwork = 'facebook' | 'instagram';

export type SocialContentType = 'POST' | 'REEL' | 'STORY';

export type SocialBridgeMode = 'draft_only' | 'schedule' | 'publish_now';

export type SocialApprovalState =
  | 'draft_generated'
  | 'approved_for_draft'
  | 'approved_for_schedule'
  | 'approved_for_publish'
  | 'needs_media'
  | 'needs_source_truth'
  | 'rejected'
  | 'completed'
  | 'failed';

export type SocialPublishState =
  | 'not_approved'
  | 'draft_created'
  | 'scheduled'
  | 'published'
  | 'blocked'
  | 'failed';

export type SocialBridgeJob = {
  id: string;
  agent: string;
  job_type: 'facebook_post' | 'instagram_post' | 'social_post';
  brand_id: string;
  timezone: string;
  network: SocialNetwork;
  content_type: SocialContentType;
  mode: SocialBridgeMode;
  approval_state: SocialApprovalState;
  publish_state: SocialPublishState;
  caption: string;
  first_comment?: string;
  media_urls?: string[];
  media_source?: string;
  scheduled_for?: string;
  attempts: number;
  max_attempts: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
};

export type SocialBridgeCreateInput = {
  agent?: string;
  job_type?: SocialBridgeJob['job_type'];
  brand_id: string;
  timezone?: string;
  network?: SocialNetwork;
  content_type?: SocialContentType;
  mode?: SocialBridgeMode;
  approval_state?: SocialApprovalState;
  caption: string;
  first_comment?: string;
  media_urls?: string[];
  media_source?: string;
  scheduled_for?: string;
  max_attempts?: number;
};

export type SocialBridgeLog = {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  job_id?: string;
  data?: Record<string, unknown>;
};
