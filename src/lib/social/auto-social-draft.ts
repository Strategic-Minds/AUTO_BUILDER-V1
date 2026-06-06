import { protectedGates } from "@/lib/autobuilder/runtime-contracts";

export const socialActions = [
  "strategy",
  "calendar",
  "content-batch",
  "assets",
  "approvals",
  "publish-drafts",
  "analytics",
  "repurpose",
  "optimize"
] as const;

type SocialAction = (typeof socialActions)[number];

export function normalizeSocialAction(action: string): SocialAction | null {
  return socialActions.includes(action as SocialAction) ? (action as SocialAction) : null;
}

export function buildSocialDraft(action: SocialAction, input: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  const systemId = String(input.system_id || input.systemId || "sandbox-system");
  const topic = String(input.topic || input.idea || "system launch");

  const common = {
    ok: true,
    action,
    system_id: systemId,
    created_at: now,
    draft_only: true,
    live_publish_allowed: false,
    protectedGates,
    approval_required_for: ["live social publishing", "auto-DMs", "mass engagement", "paid ads", "customer messages", "account setting changes"]
  };

  if (action === "strategy") {
    return {
      ...common,
      strategy: {
        topic,
        objective: "create approval-controlled social launch and optimization loop",
        cadence: "3 draft posts per account per day after approval setup",
        pillars: ["problem", "proof", "process", "offer", "behind_the_scenes", "case_study", "faq"],
        kpis: ["follows", "saves", "clicks", "qualified leads", "conversion assists"]
      }
    };
  }

  if (action === "calendar") {
    return {
      ...common,
      calendar: Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        theme: ["awareness", "problem", "solution", "proof", "offer", "faq", "recap"][index],
        posts: 3,
        status: "draft"
      }))
    };
  }

  if (action === "content-batch") {
    return {
      ...common,
      drafts: ["hook", "caption", "short_script", "image_prompt", "hashtag_set"].map((type) => ({ type, status: "draft", topic }))
    };
  }

  if (action === "assets") {
    return {
      ...common,
      assets: [
        { provider: "openai_image", type: "still", status: "prompt_packet_only" },
        { provider: "heygen", type: "avatar_video", status: "script_packet_only" },
        { provider: "xyla", type: "creative", status: "prompt_packet_only" },
        { provider: "metricool", type: "schedule", status: "csv_or_draft_packet_only" }
      ]
    };
  }

  if (action === "publish-drafts") {
    return {
      ...common,
      publish: {
        status: "blocked_without_approval",
        metricool: "draft_packet_only",
        livePublish: false
      }
    };
  }

  return {
    ...common,
    receipt: {
      status: "draft_created",
      topic,
      next: "approval_or_next_draft_step"
    }
  };
}

export function socialStatus() {
  return {
    ok: true,
    module: "auto_social",
    status: "draft_route_contract_ready",
    routes: socialActions.map((action) => `/api/social/${action}`),
    livePublishAllowed: false,
    protectedGates
  };
}
