export type BridgeApprovalState = "not_required" | "pending" | "approved" | "rejected" | "expired" | "blocked";

export type BridgeRiskClass = 0 | 1 | 2 | 3 | 4 | 5;

export type BridgeAction = {
  bridgeId: string;
  operation: string;
  system: "metricool" | "twilio" | "google_drive" | "heygen" | "nrw_social";
  riskClass: BridgeRiskClass;
  mutation: boolean;
  approvalState: BridgeApprovalState;
};

export type BridgePolicyDecision = {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
};

export const nashvilleResinWorxSocialBridge = {
  brand: "Nashville Resin Worx",
  adminEmail: "info@epoxywillchangeyourlife.com",
  twilioFromNumber: "+15616780328",
  twilioAllowedToNumber: "+17722090266",
  schedules: [
    {
      id: "nrw_morning_social_discovery",
      timezone: "America/New_York",
      hour: 8,
      minute: 0,
      phase: "morning_social_discovery"
    },
    {
      id: "nrw_midday_engagement_triage",
      timezone: "America/New_York",
      hour: 13,
      minute: 0,
      phase: "midday_engagement_triage"
    },
    {
      id: "nrw_evening_social_optimization",
      timezone: "America/New_York",
      hour: 18,
      minute: 0,
      phase: "evening_social_optimization"
    }
  ],
  bridges: {
    metricool: {
      bridgeId: "metricool_social_bridge",
      requiredEnvNames: [
        "METRICOOL_API_KEY",
        "METRICOOL_BRAND_ID",
        "METRICOOL_ALLOWED_PROFILES",
        "METRICOOL_WRITE_ENABLED"
      ],
      readOperations: ["read_profile_metrics", "read_post_metrics"],
      dryRunOperations: ["draft_scheduled_post", "create_staging_payload"],
      approvalGatedOperations: ["schedule_post", "publish_now", "delete_scheduled_post", "boost_or_ad_spend"]
    },
    twilio: {
      bridgeId: "twilio_lead_communications_bridge",
      defaultAllowedToNumbers: ["+17722090266"],
      requiredEnvNames: [
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_FROM_NUMBER",
        "TWILIO_ALLOWED_TO_NUMBERS",
        "TWILIO_STATUS_WEBHOOK_SECRET",
        "TWILIO_WRITE_ENABLED"
      ],
      readOperations: ["account_status_read", "from_number_verified"],
      dryRunOperations: ["draft_sms", "draft_call_script", "status_webhook_signature_check"],
      approvalGatedOperations: ["send_sms", "place_call", "send_mms", "configure_webhook"]
    },
    heygen: {
      bridgeId: "heygen_winner_video_bridge",
      requiredEnvNames: ["HEYGEN_API_KEY", "HEYGEN_WRITE_ENABLED"],
      readOperations: ["list_avatar_groups", "list_video_agent_sessions", "list_voices"],
      dryRunOperations: ["draft_video_prompt", "create_winner_video_spec"],
      approvalGatedOperations: ["generate_video", "publish_video", "delete_video"]
    },
    drive: {
      bridgeId: "drive_social_source_truth_bridge",
      requiredEnvNames: [
        "GOOGLE_WORKSPACE_CLIENT_ID",
        "GOOGLE_WORKSPACE_CLIENT_SECRET",
        "GOOGLE_WORKSPACE_REFRESH_TOKEN",
        "GOOGLE_DRIVE_ROOT_FOLDER_ID",
        "GOOGLE_DRIVE_WRITE_ENABLED"
      ],
      readOperations: ["drive_search", "read_auto_social_workbook", "read_nrw_social_docs"],
      dryRunOperations: ["draft_folder_plan", "draft_queue_import"],
      approvalGatedOperations: ["create_folder", "move_file", "upload_asset", "update_sheet"]
    }
  }
} as const;

const externalMutationSystems = new Set(["metricool", "twilio", "heygen", "google_drive", "nrw_social"]);

export function classifyNrwBridgeAction(action: BridgeAction): BridgePolicyDecision {
  if (action.riskClass <= 1 && !action.mutation) {
    return { allowed: true, approvalRequired: false, reason: "read_or_dry_run_allowed" };
  }

  if (externalMutationSystems.has(action.system) && action.approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "external_mutation_requires_approval" };
  }

  if (action.riskClass >= 2 && action.approvalState !== "approved") {
    return { allowed: false, approvalRequired: true, reason: "risk_class_requires_approval" };
  }

  if (action.riskClass === 5) {
    return { allowed: false, approvalRequired: true, reason: "class_5_manual_execution_gate" };
  }

  return { allowed: true, approvalRequired: false, reason: "approved_by_policy" };
}

export function getMissingEnvNames(env: Record<string, string | undefined>, requiredEnvNames: readonly string[]) {
  return requiredEnvNames.filter((name) => !env[name]);
}

export function isTwilioRecipientAllowed(to: string, env: Record<string, string | undefined>) {
  const allowed = (env.TWILIO_ALLOWED_TO_NUMBERS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return allowed.includes(to) || allowed.includes("*");
}

export function createNrwTwilioDraftReceipt(input: {
  operation: "draft_sms" | "draft_call_script";
  to: string;
  body: string;
  leadId?: string;
}) {
  return {
    kind: "validation",
    bridge_id: "twilio_lead_communications_bridge",
    operation: input.operation,
    risk_class: 1,
    mutation: false,
    approval_state: "not_required",
    target: {
      system: "twilio",
      resource_id: input.leadId || "unassigned_lead"
    },
    payload: {
      to: input.to,
      body_preview: input.body.slice(0, 280)
    },
    result: {
      status: "completed",
      summary: "Twilio draft receipt created without sending."
    }
  };
}

export function validateApprovedTwilioExecution(input: {
  operation: "send_sms" | "place_call" | "send_mms" | "configure_webhook";
  to: string;
  approvalId?: string;
  env: Record<string, string | undefined>;
}) {
  const policy = classifyNrwBridgeAction({
    bridgeId: "twilio_lead_communications_bridge",
    operation: input.operation,
    system: "twilio",
    riskClass: 4,
    mutation: true,
    approvalState: input.approvalId ? "approved" : "pending"
  });

  if (!policy.allowed) return policy;
  if (input.env.TWILIO_WRITE_ENABLED !== "true") {
    return { allowed: false, approvalRequired: true, reason: "twilio_write_flag_disabled" };
  }
  if (!isTwilioRecipientAllowed(input.to, input.env)) {
    return { allowed: false, approvalRequired: true, reason: "twilio_recipient_not_allowlisted" };
  }

  const missing = getMissingEnvNames(input.env, nashvilleResinWorxSocialBridge.bridges.twilio.requiredEnvNames);
  if (missing.length > 0) {
    return { allowed: false, approvalRequired: true, reason: `missing_env:${missing.join(",")}` };
  }

  return { allowed: true, approvalRequired: false, reason: "approved_by_policy" };
}
