import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";

import {
  autoBuilderHandoffWorkflow,
  type AutoBuilderHandoffWorkflowInput,
} from "@/workflows/auto-builder-handoff-workflow";
import { requiresOperatorAuth, verifyExecutionRouteAuth } from "@/lib/autobuilder-v2/execution-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    name: "AUTO BUILDER Handoff Vercel Workflow",
    mode: "durable_preview_first_handoff",
    defaultInput: {
      targetSystem: "auto_builder",
      mode: "execute",
      deploymentMode: "preview",
      ref: "main",
      verifyRoutes: [
        "/api/runtime/readiness",
        "/api/runtime/jobs",
        "/api/browser/process",
        "/api/bridge/vercel/redeploy",
        "/api/mcp/manifest",
      ],
    },
    routes: {
      start: "/api/workflows/auto-builder-handoff",
      runStatus: "/api/workflows/auto-builder-handoff/run/:runId",
      events: "/api/workflows/auto-builder-handoff/readable/:runId",
      productionApproval: "/api/workflows/auto-builder-handoff/approval",
    },
    governance: {
      previewRedeploys: "allowed through operator-authenticated workflow start",
      productionDeploys: "wait for APPROVE PRODUCTION DEPLOY inside workflow",
      protectedActionsBlocked: [
        "environment mutation",
        "Supabase production migration",
        "Drive write",
        "social publish",
        "outbound message",
        "billing or spend",
        "destructive action",
      ],
    },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as AutoBuilderHandoffWorkflowInput;
  const input: AutoBuilderHandoffWorkflowInput = {
    ...body,
    workflowId: body.workflowId ?? `auto-builder-handoff-${Date.now()}`,
    mode: body.mode ?? "execute",
    deploymentMode: body.deploymentMode ?? "preview",
    targetSystem: body.targetSystem ?? "auto_builder",
  };

  if (requiresOperatorAuth(input as Record<string, unknown>) || input.deploymentMode === "production") {
    const auth = verifyExecutionRouteAuth(request);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const run = await start(autoBuilderHandoffWorkflow, [input]);
  const runId = run.runId;

  return NextResponse.json({
    ok: true,
    runId,
    workflowId: input.workflowId,
    workflow: "autoBuilderHandoffWorkflow",
    statusUrl: `/api/workflows/auto-builder-handoff/run/${runId}`,
    eventsUrl: `/api/workflows/auto-builder-handoff/readable/${runId}`,
    approvalUrl: "/api/workflows/auto-builder-handoff/approval",
    nextActions: [
      "Stream workflow events until deployment and route verification complete.",
      "Only use the approval route if the workflow emits an awaiting_approval event for production.",
    ],
  });
}
