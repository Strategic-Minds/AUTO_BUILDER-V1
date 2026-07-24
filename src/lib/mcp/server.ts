import { canonicalHash } from '../pipeline/idempotency';

export const MCP_VERSION = '2024-11-05';
export const SUPPORTED_MCP_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'] as const;

export function negotiateMcpVersion(requested: unknown): string {
  return typeof requested === 'string' && (SUPPORTED_MCP_VERSIONS as readonly string[]).includes(requested)
    ? requested
    : MCP_VERSION;
}
export const GATEWAY_VERSION = '2.0.0-reality-os';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  scope: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  receiptBehavior: 'NONE' | 'TRACE' | 'FULL';
}

export interface MCPCapabilities {
  tools: MCPTool[];
  version: string;
  gatewayVersion: string;
  environment: string;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export function createMCPResponse(id: string | number, result: unknown): MCPResponse {
  return { jsonrpc: '2.0', id, result };
}

export function createMCPError(id: string | number, code: number, message: string, data?: unknown): MCPResponse {
  return { jsonrpc: '2.0', id, error: { code, message, data } };
}

export function createReceiptId(tool: string, input: unknown): string {
  return `RCP-${tool.toUpperCase().replace('.', '-')}-${Date.now()}-${canonicalHash(input).slice(0, 8)}`;
}
