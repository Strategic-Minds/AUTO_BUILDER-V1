import { NextRequest, NextResponse } from "next/server";
import {
  insertTelemetry,
  readRecentTelemetry,
  readTelemetryByQuery,
  telemetryStoreStatus,
  updateTelemetry
} from "@/lib/telemetry-store";

const PROJECT_ID = "prhppuuwcnmfdhwsagug";
const BRIDGE_SOURCE = "supabase-live-bridge";
const TASK_TYPE = "supabase_connector_action";
const CONNECTOR = "supabase";
const SAFE_OPERATIONS = new Set(["execute_sql", "apply_migration", "deploy_edge_function", "insert_telemetry", "upsert_bridge_state", "status_check"]);

async function upsertBridgeState(operation: string, requestPayload: Record<string, unknown>, status: string) {
  const scope = "connector";
  const key = `supabase:${PROJECT_ID}`;
  const now = new Date().toISOString();
  const existing = await readTelemetryByQuery("autobuilder_bridge_state", {
    select: "*",
    scope: `eq.${scope}`,
    key: `eq.${key}`,
    limit: "1"
  });

  const payload = {
    scope,
    key,
    status,
    payload: requestPayload,
    state: requestPayload,
    metadata: {
      project_id: PROJECT_ID,
      source: BRIDGE_SOURCE,
      connector: CONNECTOR,
      operation
    },
    last_write_at: now,
    updated_at: now
  };

  const row = existing.ok ? (existing.rows[0] as Record<string, unknown> | undefined) : undefined;
  if (row?.id && typeof row.id === "string") {
    return updateTelemetry("autobuilder_bridge_state", payload, { id: `eq.${row.id}` });
  }

  return insertTelemetry("autobuilder_bridge_state", {
    id: `${scope}:${key}`,
    ...payload,
    created_at: now
  });
}

export async function GET() {
  const [stateRows, connectorActions, taskRows, blockerRows] = await Promise.all([
    readTelemetryByQuery("autobuilder_bridge_state", {
      select: "*",
      scope: "eq.connector",
      key: `eq.supabase:${PROJECT_ID}`,
      limit: "1"
    }),
    readTelemetryByQuery("bridge_connector_actions", {
      select: "*",
      project_ref: `eq.${PROJECT_ID}`,
      connector: `eq.${CONNECTOR}`,
      order: "created_at.desc",
      limit: "20"
    }),
    readTelemetryByQuery("bridge_tasks", {
      select: "*",
      task_type: `eq.${TASK_TYPE}`,
      target: `eq.${PROJECT_ID}`,
      order: "created_at.desc",
      limit: "20"
    }),
    readRecentTelemetry("bridge_blockers", "created_at", 20)
  ]);

  const openBlockers = blockerRows.ok
    ? blockerRows.rows.filter((row: unknown) => (row as Record<string, unknown>).state === "open").length
    : 0;

  return NextResponse.json({
    ok: true,
    projectId: PROJECT_ID,
    source: BRIDGE_SOURCE,
    store: telemetryStoreStatus(),
    openBlockers,
    stateRows,
    connectorActions,
    taskRows,
    blockerRows
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    operation?: string;
    projectRef?: string;
    targetRef?: string;
    requestPayload?: Record<string, unknown>;
    resultPayload?: Record<string, unknown>;
    approved?: boolean;
    safe?: boolean;
    priority?: string;
    requestedBy?: string;
  };

  const projectRef = body.projectRef ?? PROJECT_ID;
  const operation = body.operation?.trim() || "status_check";
  const approved = body.approved === true;
  const safe = body.safe === true || SAFE_OPERATIONS.has(operation);
  const blockedReason = projectRef !== PROJECT_ID
    ? `Project ${projectRef} is not enabled for the live bridge.`
    : !approved
      ? "Supabase live bridge action requires approval."
      : !safe
        ? `Supabase connector action ${operation} is not allowed by the live bridge.`
        : null;
  const now = new Date().toISOString();
  const taskPrompt = `Supabase connector action for ${PROJECT_ID}: ${operation}`;

  const connectorAction = await insertTelemetry("bridge_connector_actions", {
    project_ref: projectRef,
    connector: CONNECTOR,
    operation,
    action_status: blockedReason ? "blocked" : "completed",
    target_ref: body.targetRef ?? PROJECT_ID,
    request_payload: body.requestPayload ?? {},
    result_payload: body.resultPayload ?? {},
    error_message: blockedReason,
    requested_by: body.requestedBy ?? BRIDGE_SOURCE,
    approved,
    safe,
    completed_at: blockedReason ? null : now,
    created_at: now,
    updated_at: now
  });

  const connectorActionId = connectorAction.response?.[0]?.id ?? null;
  const taskInsert = await insertTelemetry("bridge_tasks", {
    command_ref: typeof connectorActionId === "string" ? connectorActionId : null,
    task_type: TASK_TYPE,
    task_prompt: taskPrompt,
    target: PROJECT_ID,
    priority: body.priority ?? "high",
    state: blockedReason ? "blocked" : "completed",
    approved,
    safe,
    created_at: now
  });

  let blockerInsert: unknown = null;
  if (blockedReason) {
    blockerInsert = await insertTelemetry("bridge_blockers", {
      task_ref: taskInsert.response?.[0]?.id ?? null,
      blocker: blockedReason,
      state: "open",
      created_at: now
    });
  }

  const bridgeState = await upsertBridgeState(
    operation,
    {
      project_id: PROJECT_ID,
      operation,
      request_payload: body.requestPayload ?? {},
      result_payload: body.resultPayload ?? {},
      approved,
      safe,
      status: blockedReason ? "blocked" : "completed",
      updated_at: now
    },
    blockedReason ? "blocked" : "ready"
  );

  return NextResponse.json({
    ok: true,
    projectId: PROJECT_ID,
    source: BRIDGE_SOURCE,
    connectorAction,
    taskInsert,
    bridgeState,
    blockerInsert
  });
}
