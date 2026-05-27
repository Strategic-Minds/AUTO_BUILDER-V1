export const dynamic = "force-dynamic";

const yaml = `openapi: 3.0.1
info:
  title: AUTO BUILDER
  version: 0.3.2
  description: Minimal single-action schema for AUTO BUILDER ChatGPT action registration.
servers:
  - url: https://auto-builder-livid.vercel.app
paths:
  /api/actions/stack-status:
    get:
      operationId: autobuilderStackStatus
      summary: Get AUTO BUILDER stack status
      responses:
        "200":
          description: AUTO BUILDER stack status
`;

export async function GET() {
  return new Response(yaml, {
    status: 200,
    headers: {
      "content-type": "text/yaml; charset=utf-8"
    }
  });
}
