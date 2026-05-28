import { NextRequest, NextResponse } from 'next/server';

function authorized(request: NextRequest) {
  const expected = process.env.CRON_API_TOKEN;
  if (!expected) return true;
  const token = request.headers.get('x-cron-token') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return token === expected;
}

function postPacket(kind: 'authority' | 'proof' | 'cta') {
  const base = {
    platform: 'facebook-first',
    status: 'packet_ready_not_published',
    approvalRequiredForPublish: true,
    livePublishPerformed: false,
    autoEngagementPerformed: false,
    receiptRequired: true
  };

  if (kind === 'authority') {
    return {
      ...base,
      kind,
      hook: 'Most businesses do not need more tools. They need one governed operating system that makes the tools work together.',
      cta: 'If your tools are disconnected, start by mapping the system behind them.',
      visual: 'Diagram: Idea -> Content -> Store -> Revenue -> Feedback Loop'
    };
  }

  if (kind === 'proof') {
    return {
      ...base,
      kind,
      hook: 'The biggest failure point in AI automation is continuity.',
      cta: 'If your AI workflow keeps losing context, the operating system around it needs work.',
      visual: 'Checklist: Phase / Step / Blocker / Workaround / Self-Heal / Next Action'
    };
  }

  return {
    ...base,
    kind,
    hook: 'Ideas do not scale. Systems scale.',
    cta: 'Comment SYSTEM if you want your idea mapped into an AI-powered workflow.',
    visual: 'Bold text graphic: Ideas do not scale. Systems scale.'
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const packets = [postPacket('authority'), postPacket('proof'), postPacket('cta')];

  return NextResponse.json({
    ok: true,
    system: 'AUTO_BUILDER_SOCIAL_CONTROL',
    mode: 'governed_packet_loop',
    timestamp: now,
    goal: 'Create governed Facebook-first social content packets every cron pass while blocking live publish and engagement until approved.',
    cadence: {
      cron: '*/5 * * * *',
      dailyPostingTarget: 3,
      pillars: ['authority', 'proof', 'cta']
    },
    governance: {
      livePublishAllowed: false,
      autoDmAllowed: false,
      massEngagementAllowed: false,
      accountSettingMutationAllowed: false,
      approvalRequiredForPublish: true
    },
    agents: [
      'social_content_planner',
      'facebook_packet_builder',
      'repurpose_distribution_planner',
      'engagement_reply_drafter',
      'receipt_checker',
      'governance_preflight'
    ],
    workflow: [
      'intake_social_objective',
      'generate_content_packets',
      'prepare_repurpose_distribution_packet',
      'prepare_facebook_packet',
      'wait_for_approval_or_receipt',
      'analyze_receipt',
      'generate_next_packet'
    ],
    sandbox: {
      firstLane: 'packet_generation_only',
      secondLane: 'receipt_collection',
      thirdLane: 'approval_gated_publish_connector'
    },
    packets,
    nextInstruction: 'PHASE-12 / STEP-8 : Rehydrate AUTO BUILDER social control continuity. Validate /api/cron/social-control, confirm Vercel cron schedule, then build packet-only social MCP tools and receipt logging. Do not publish live or auto-engage without exact approval.'
  });
}
