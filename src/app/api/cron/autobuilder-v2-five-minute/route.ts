import { runAutoBuilderV2Workflow } from "@/lib/autobuilder-v2/workflow-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const workflow = runAutoBuilderV2Workflow();

  return Response.json({
    ok: workflow.ok,
    schedule: "*/5 * * * *",
    service: "autobuilder-v2-five-minute",
    workflow
  });
}

export async function POST() {
  return GET();
}
