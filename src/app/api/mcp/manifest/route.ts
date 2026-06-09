import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: 'AUTO BUILDER',
    description: 'Governed recursive orchestration MCP bridge for Strategic Minds Advisory.',
    version: '0.2.0',
    auth: {
      type: 'bearer',
      header: 'Authorization',
    },
    endpoints: {
      mcp: '/api/mcp',
      tools: '/api/mcp/tools',
      openapi: '/.well-known/openapi.yaml',
      plugin: '/.well-known/ai-plugin.json',
    },
    tools: [
      'autobuilder_stack_status',
      'governance_preflight',
      'create_repurpose_task_packet',
      'recursive_prompt_chain_next',
      'run_drive_job',
      'drive_list_tree',
      'drive_create_folder',
      'drive_upload_file',
      'drive_upload_image',
      'drive_move_file',
      'drive_move_folder',
      'drive_write_receipt',
    ],
    governance: {
      finalBlockRule:
        'The executive final block is the official manual and recursive continuation handoff. If Jeremy skips the body, the final block must still contain enough summary, blocks, workaround, self-heal result, and next GPT instruction to continue safely.',
      driveFolderCreateRule:
        'drive_create_folder defaults to dry-run. Live folder creation requires dry_run=false, approved_actions including create_missing_folders, and approval_phrase exactly APPROVE DRIVE FOLDER CREATE.',
    },
  });
}
