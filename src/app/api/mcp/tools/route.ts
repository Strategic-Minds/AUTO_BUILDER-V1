import { NextResponse } from 'next/server';

import {
  activeOperatingMap,
  autoBuilder2ExecutionToolNames,
  expectedCallableMcpToolNames,
  readInspectionToolNames,
  requiredEnvNames
} from '@/lib/autobuilder-v2/execution-tools';

export const dynamic = 'force-dynamic';

const googleFormsToolName = 'create_google_form' as const;
const mcpToolNames = [...expectedCallableMcpToolNames, googleFormsToolName] as const;
const mcpExecutionToolNames = [...autoBuilder2ExecutionToolNames, googleFormsToolName] as const;

const toolDescriptions: Record<string, string> = {
  health_check: 'Confirm the Auto Builder 2 MCP server is alive before using other tools.',
  get_repo_summary: 'Inspect repo, provider, active operating map, and advertised execution surfaces.',
  list_repo_files: 'List the bundled repo paths exposed through the MCP control-plane view.',
  read_bootstrap_status: 'Inspect package metadata, scripts, bootstrap status, and callable tool expectations.',
  read_text_file: 'Read a bundled UTF-8 control-plane file by path.',
  run_job: 'Generic GPT-safe job entrypoint with dry-run default, receipts, rollback metadata, and universal routing.',
  run_universal_job: 'Cross-stack universal automation runner for governed end-to-end operations.',
  create_google_form: 'Create a Google Form through the Google Forms API using Google Workspace service-account credentials.',
  run_drive_job: 'Plan or route Google Drive jobs with dry-run default and receipt metadata.',
  drive_list_tree: 'Read or plan a Google Drive folder tree listing.',
  drive_create_folder: 'Dry-run or approval-gated Google Drive folder creation.',
  drive_move_folder: 'Plan moving a Google Drive folder and return rollback parent metadata.',
  drive_move_file: 'Plan moving a Google Drive file and return rollback parent metadata.',
  drive_write_receipt: 'Plan writing a Google Drive receipt without exposing secrets.',
  run_platform_provisioning_job: 'Route GitHub, Vercel, and AI Gateway provisioning actions.',
  create_github_repo: 'Dry-run or approval-gated GitHub repository creation.',
  create_vercel_project: 'Dry-run or approval-gated Vercel project creation.',
  create_vercel_workflow: 'Plan Vercel workflow or cron creation.',
  create_vercel_agent: 'Plan Vercel agent creation.',
  create_ai_gateway: 'Plan AI Gateway creation.',
  rollback: 'Plan rollback or return adapter-required metadata for provider rollback.'
};

export async function GET() {
  return NextResponse.json({
    app: 'AUTO BUILDER 2',
    version: '0.5.0-google-forms',
    transport: 'streamable-http',
    activeOperatingMap,
    tools: mcpToolNames.map((name) => ({
      name,
      title: name,
      description: toolDescriptions[name] ?? 'Auto Builder MCP tool.',
      group: readInspectionToolNames.some((toolName) => toolName === name) ? 'inspection' : 'execution'
    })),
    executionTools: mcpExecutionToolNames,
    requiredEnvNames,
    governance: {
      defaultWriteMode: 'dry_run',
      executeRule: 'Write-capable tools must not mutate external systems unless mode is execute and the provider-specific adapter/approval gate allows it.',
      googleFormsRule: 'create_google_form performs live Forms API creation only when mode=execute and GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY are configured.',
      secretRule: 'Responses return required environment variable names only; secret values are never returned.',
      rollbackRule: 'Every write-like result includes rollback metadata or an adapter-required rollback note.'
    }
  });
}
