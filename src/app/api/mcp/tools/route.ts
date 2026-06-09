import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    app: 'AUTO BUILDER',
    version: '0.3.0',
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
      {
        name: 'run_drive_job',
        title: 'Run Drive Job',
        description: 'Plans governed Google Drive folder, file, image, move, receipt, and validation jobs with dry-run defaults.',
      },
      {
        name: 'drive_list_tree',
        title: 'Drive List Tree',
        description: 'Plans and validates listing a Google Drive folder tree.',
      },
      {
        name: 'drive_create_folder',
        title: 'Drive Create Folder',
        description: 'Plans Google Drive folder creation by default and executes only with dry_run=false, approved_actions, and the exact approval phrase.',
      },
      {
        name: 'drive_upload_file',
        title: 'Drive Upload File',
        description: 'Plans upload of a file into Google Drive.',
      },
      {
        name: 'drive_upload_image',
        title: 'Drive Upload Image',
        description: 'Plans upload of an image into Google Drive.',
      },
      {
        name: 'drive_move_file',
        title: 'Drive Move File',
        description: 'Plans moving a Google Drive file to another folder.',
      },
      {
        name: 'drive_move_folder',
        title: 'Drive Move Folder',
        description: 'Plans moving a Google Drive folder to another folder.',
      },
      {
        name: 'drive_write_receipt',
        title: 'Drive Write Receipt',
        description: 'Plans writing a Google Drive job receipt.',
      },
      {
        name: 'run_eden_social_loop',
        title: 'Run Eden Skye Social Loop',
        description: 'Runs the EdenSkyeStudios.com website, social, model, membership, validation, quarantine, and memory loop in dry-run/draft mode.',
      },
      {
        name: 'run_eden_website_build_workflow',
        title: 'Run Eden Website Build Workflow',
        description: 'Plans the Vercel Workflow backend/frontend build for EdenSkyeStudios.com and Eden Closet without production deployment.',
      },
      {
        name: 'run_metricool_job',
        title: 'Run Metricool Job',
        description: 'Prepares Metricool draft scheduling and analytics jobs. Public posting remains approval-gated.',
      },
      {
        name: 'run_shopify_xyla_job',
        title: 'Run Shopify Xyla Job',
        description: 'Uses Shopify as the Xyla operating bridge for draft collections, feed packets, products, metafields, and model/member content surfaces.',
      },
      {
        name: 'run_edens_closet_membership_job',
        title: "Run Eden's Closet Membership Job",
        description: 'Plans Black Card membership products, age gate, entitlement, sign-in, and draft checkout flows. Billing activation and adult-content release require explicit approval.',
      },
    ],
    governance: {
      protectedMutationRule:
        'No workflow, governance, source-truth, billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon, Sheets canon, or authority-file mutation without Jeremy explicit current-session command.',
      driveFolderCreateRule:
        'drive_create_folder defaults to dry-run. Live folder creation requires dry_run=false, approved_actions including create_missing_folders, and approval_phrase exactly APPROVE DRIVE FOLDER CREATE.',
      edenClosetRule:
        'Eden Closet / Black Card membership work defaults to design, schema, draft checkout, and compliance planning only. Payment activation, adult-content release, public publishing, and subscriber messaging require explicit approval.',
      socialPublishingRule:
        'Metricool and Shopify/Xyla jobs default to draft packets. Public posts, comments, replies, DMs, and paid campaigns require approval.'
    },
  });
}
