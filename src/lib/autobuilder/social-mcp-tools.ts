import { z } from 'zod';

import { socialGovernancePreflight } from './social-governance';
import { getSocialContentQueueStatus } from './social-status';

type McpServerLike = {
  registerTool: (...args: any[]) => any;
};

function socialEnvelope(args: {
  tool: string;
  status?: 'ok' | 'blocked' | 'approval_required' | 'error';
  mode: 'status_only' | 'governance_only';
  result: unknown;
  blockers?: string[];
  nextStep: string;
}) {
  return {
    tool: args.tool,
    status: args.status ?? 'ok',
    mode: args.mode,
    livePublished: false,
    autoEngagementPerformed: false,
    approvalRequired: args.status === 'approval_required',
    result: args.result,
    receipt: null,
    blockers: args.blockers ?? [],
    nextStep: args.nextStep
  };
}

function textResponse(value: unknown) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function registerSocialMcpTools(server: McpServerLike) {
  server.registerTool(
    'social_governance_preflight',
    {
      title: 'Social Governance Preflight',
      description: 'Classify a social action as packet-safe, approval-required, or blocked. Does not publish, DM, engage, or mutate accounts.',
      inputSchema: {
        action: z.string(),
        livePublish: z.boolean().optional(),
        autoDm: z.boolean().optional(),
        massEngage: z.boolean().optional(),
        accountMutation: z.boolean().optional()
      }
    },
    async (args: {
      action: string;
      livePublish?: boolean;
      autoDm?: boolean;
      massEngage?: boolean;
      accountMutation?: boolean;
    }) => {
      const result = socialGovernancePreflight(args);
      const status = result.status === 'blocked'
        ? 'blocked'
        : result.status === 'approval_required'
          ? 'approval_required'
          : 'ok';

      return textResponse(
        socialEnvelope({
          tool: 'social_governance_preflight',
          status,
          mode: 'governance_only',
          result,
          blockers: status === 'blocked' ? [result.reason] : [],
          nextStep: status === 'ok'
            ? 'Proceed with packet-only or receipt-only social workflow.'
            : 'Request exact approval or revise the requested social action.'
        })
      );
    }
  );

  server.registerTool(
    'get_social_content_queue_status',
    {
      title: 'Get Social Content Queue Status',
      description: 'Return the current governed social content queue posture. Status-only; no publishing or engagement occurs.',
      inputSchema: {}
    },
    async () => {
      const result = getSocialContentQueueStatus();
      return textResponse(
        socialEnvelope({
          tool: 'get_social_content_queue_status',
          status: 'ok',
          mode: 'status_only',
          result,
          nextStep: result.nextStep
        })
      );
    }
  );
}
