import { runAutoBuilderV2Workflow } from "@/lib/autobuilder-v2/workflow-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(runAutoBuilderV2Workflow());
}

export async function POST() {
  return Response.json(runAutoBuilderV2Workflow());
}
