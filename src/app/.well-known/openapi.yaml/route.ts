export const dynamic = 'force-dynamic';

const yaml = `openapi: 3.1.0
info:
  title: AUTO BUILDER MCP Bridge
  version: 0.2.0
  description: Governed recursive orchestration bridge for Strategic Minds Advisory.
servers:
  - url: https://auto-builder-livid.vercel.app
paths:
  /api/mcp:
    get:
      operationId: getMcpStatus
      summary: Get MCP bridge status
      responses:
        "200":
          description: MCP status
    post:
      operationId: callMcpJsonRpc
      summary: Call MCP JSON-RPC endpoint
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: JSON-RPC response
  /api/mcp/tools:
    get:
      operationId: listAutoBuilderTools
      summary: List AUTO BUILDER tools
      responses:
        "200":
          description: Tool list
  /api/mcp/manifest:
    get:
      operationId: getAutoBuilderManifest
      summary: Get AUTO BUILDER manifest
      responses:
        "200":
          description: Manifest
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
`;

export async function GET() {
  return new Response(yaml, {
    status: 200,
    headers: {
      'content-type': 'text/yaml; charset=utf-8',
    },
  });
}
