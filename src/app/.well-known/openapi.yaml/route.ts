export const dynamic = "force-dynamic";

const yaml = `openapi: 3.1.0
info:
  title: AUTO BUILDER MCP and REST Bridge
  version: 0.3.0
  description: Governed recursive orchestration bridge for Strategic Minds Advisory.
servers:
  - url: https://auto-builder-livid.vercel.app
paths:
  /api/actions/stack-status:
    get:
      operationId: autobuilderStackStatus
      summary: Get AUTO BUILDER stack status
      responses:
        "200":
          description: Stack status
    post:
      operationId: autobuilderStackStatusPost
      summary: Get AUTO BUILDER stack status by POST
      responses:
        "200":
          description: Stack status
  /api/actions/governance-preflight:
    post:
      operationId: governancePreflight
      summary: Run governance preflight
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: Governance classification
  /api/actions/repurpose-task-packet:
    post:
      operationId: createRepurposeTaskPacket
      summary: Create governed repurpose task packet
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: Repurpose task packet
  /api/actions/recursive-prompt-chain-next:
    post:
      operationId: recursivePromptChainNext
      summary: Extract or generate next GPT instruction from prior final block
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: Recursive continuation result
  /api/bridge/registry:
    get:
      operationId: bridgeRegistry
      summary: Get AUTO BUILDER bridge registry
      responses:
        "200":
          description: Bridge registry
  /api/bridge/http:
    post:
      operationId: genericHttpBridgePlan
      summary: Create generic HTTP bridge plan without execution
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: HTTP bridge plan
  /api/bridge/webhook:
    get:
      operationId: webhookStatus
      summary: Get webhook route status
      responses:
        "200":
          description: Webhook status
    post:
      operationId: webhookIntake
      summary: Receive governed webhook intake
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
      responses:
        "200":
          description: Webhook intake result
  /api/mcp:
    get:
      operationId: getMcpStatus
      summary: Get MCP status
      responses:
        "200":
          description: MCP status
    post:
      operationId: callMcpJsonRpc
      summary: Call MCP JSON-RPC endpoint
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
`;

export async function GET() {
  return new Response(yaml, {
    status: 200,
    headers: {
      "content-type": "text/yaml; charset=utf-8"
    }
  });
}
