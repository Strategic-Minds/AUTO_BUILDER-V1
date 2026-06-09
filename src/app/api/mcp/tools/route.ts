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
    ],
    governance: {
      protectedMutationRule:
        'No workflow, governance, source-truth, billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon, Sheets canon, or authority-file mutation without Jeremy explicit current-session command.',
      driveFolderCreateRule:
        'drive_create_folder defaults to dry-run. Live folder creation requires dry_run=false, approved_actions including create_missing_folders, and approval_phrase exactly APPROVE DRIVE FOLDER CREATE.',
    },
  });
}
