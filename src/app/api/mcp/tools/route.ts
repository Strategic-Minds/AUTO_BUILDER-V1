import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    app: 'AUTO BUILDER',
    version: '0.2.0',
    tools: [
      {
        name: 'autobuilder_stack_status',
        title: 'AUTO BUILDER Stack Status',
        description: 'Returns AUTO BUILDER stack, governance posture, canon links, and closed-loop target.',
      },
      {
        name: 'governance_preflight',
        title: 'Governance Preflight',
        description: 'Classifies requested action as safe, blocked, or requiring Jeremy approval.',
      },
      {
        name: 'create_repurpose_task_packet',
        title: 'Create Repurpose Task Packet',
        description: 'Creates governed task packet for video repurposing, Drive handoff, publishing, and attribution.',
      },
      {
        name: 'recursive_prompt_chain_next',
        title: 'Recursive Prompt Chain Next',
        description: 'Extracts or creates the next executable GPT instruction from the prior response final block.',
      },
    ],
    governance: {
      protectedMutationRule:
        'No workflow, governance, source-truth, billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon, Sheets canon, or authority-file mutation without Jeremy explicit current-session command.',
    },
  });
}
