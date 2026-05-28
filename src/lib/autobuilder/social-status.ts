export function getSocialContentQueueStatus() {
  return {
    queue: 'social_content_queue',
    status: 'packet_mode',
    livePublishingEnabled: false,
    autoEngagementEnabled: false,
    nextStep: 'Validate connector publishing path and receipt capture.'
  };
}
