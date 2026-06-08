import { runAutoBuilderV2Validation } from "@/lib/autobuilder-v2/validation-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(runAutoBuilderV2Validation());
}

export async function POST() {
  return Response.json(runAutoBuilderV2Validation());
}
