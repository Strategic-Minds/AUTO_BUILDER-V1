import { NextResponse } from 'next/server';

import {
  activeOperatingMap,
  autoBuilder2ExecutionToolNames,
  expectedCallableMcpToolNames,
  requiredEnvNames
} from '@/lib/autobuilder-v2/execution-tools';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: 'AUTO BUILDER 2',
    description: 'Governed universal orchestration MCP bridge for Strategic Minds Advisory.',
    version: '0.4.0',
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
    tools: expectedCallableMcpToolNames,
    executionTools: autoBuilder2ExecutionToolNames,
    requiredEnvNames,
    governance: {
      defaultMode: 'dry_run',
      executionRule: 'Live mutations require mode=execute or governed approved_write plus any provider-specific approval/adapter gate.',
      secretRule: 'Return environment variable names only; never return token, key, password, connection string, or private key values.',
      rollbackRule: 'Every write-like action must return rollback metadata.'
    }
  });
}
