import { NextResponse } from 'next/server';

import {
  activeOperatingMap,
  autoBuilder2ExecutionToolNames,
  expectedCallableMcpToolNames,
  requiredEnvNames
} from '@/lib/autobuilder-v2/execution-tools';

export const dynamic = 'force-dynamic';

const googleFormsToolName = 'create_google_form' as const;
const mcpToolNames = [...expectedCallableMcpToolNames, googleFormsToolName] as const;
const mcpExecutionToolNames = [...autoBuilder2ExecutionToolNames, googleFormsToolName] as const;

export async function GET() {
  return NextResponse.json({
    name: 'AUTO BUILDER 2',
    description: 'Governed universal orchestration MCP bridge for Strategic Minds Advisory.',
    version: '0.5.0-google-forms',
    auth: {
      type: 'bearer',
      header: 'Authorization'
    },
    endpoints: {
      mcp: '/api/mcp',
      tools: '/api/mcp/tools',
      plugin: '/.well-known/ai-plugin.json'
    },
    discovery: {
      authoritative: 'mcp',
      openapiAdvertised: false,
      reason: 'MCP streamable-http discovery is authoritative. No OpenAPI URL is advertised unless a live endpoint exists and is validator-covered.'
    },
    activeOperatingMap,
    tools: mcpToolNames,
    executionTools: mcpExecutionToolNames,
    requiredEnvNames,
    governance: {
      defaultMode: 'dry_run',
      executionRule: 'Live mutations require mode=execute or governed approved_write plus any provider-specific approval/adapter gate.',
      googleFormsRule: 'create_google_form uses the Google Forms API and Google Workspace service-account credentials. The Google Forms API must be enabled for the Cloud project.',
      secretRule: 'Return environment variable names only; never return token, key, password, connection string, or private key values.',
      rollbackRule: 'Every write-like action must return rollback metadata.'
    }
  });
}
