import { NextRequest, NextResponse } from "next/server";
import {
  insertTelemetry,
  readTelemetryByQuery,
  telemetryStoreStatus,
  updateTelemetry
} from "@/lib/telemetry-store";

const PROJECT_ID = "prhppuuwcnmfdhwsagug";
const BRIDGE_SOURCE = "supabase-live-bridge";
const TASK_TYPE = "supabase_connector_action";

async function upsertBridgeState(operation: string, requestPayload: Record<string, unknown>, status: string) {
  const scope = "connector";
  const key = `supabase:${operation}`;
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
    state: requestPayload,
    metadata: {
      project_id: PROJECT_ID,
      source: BRIDGE_SOURCE,
      operation
    },
    last_write_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const row = existing.ok ? (existing.rows[0] as Record<string, unknown> | undefined) : undefined;
  if (row?.id && typeof row.id === "string") {
    return updateTelemetry("autobuilder_bridge_state", payload, { id: `eq.${row.id}` });
  }

  return insertTelemetry("autobuilder_bridge_state", {
    ...payload,
    created_at: new Date().toISOString()
  });
}

export async function GET() {
  const [stateRows, commandRows, taskRows, blockerRows] = await Promise.all([
    readTelemetryByQuery("autobuilder_bridge_state", {
      select: "*",
      scope: "eq.connector",
      order: "updated_at.desc",
      limit: "20"
    }),
    readTelemetryByQuery("bridge_commands", {
      select: "*",
      source: `eq.${BRIDGE_SOURCE}`,
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
    readTelemetryByQuery("bridge_blockers", {
      select: "*",
      order: "created_at.desc",
      limit: "20"
    })
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
    commandRows,
    taskRows,
    blockerRows
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    operation?: string;
    requestPayload?: Record<string, unknown>;
    approved?: boolean;
    safe?: boolean;
    priority?: string;
  };

  const operation = body.operation?.trim() || "status-check";
  const approved = body.approved === true;
  const safe = body.safe !== false;
  const blockedReason = approved && safe ? null : "Supabase live bridge action requires approval or was marked unsafe.";
  const now = new Date().toISOString();
  const taskPrompt = `Supabase connector action for ${PROJECT_ID}: ${operation}`;

  const commandInsert = await insertTelemetry("bridge_commands", {
    source: BRIDGE_SOURCE,
    task_type: TASK_TYPE,
    task_prompt: taskPrompt,
    target: PROJECT_ID,
    priority: body.priority ?? "high",
    approved,
    safe,
    blocked_reason: blockedReason,
    created_at: now
  });

  const commandId = commandInsert.ok ? (commandInsert.rows?.[0] as Record<string, unknown> | undefined)?.id ?? null : null;

  const taskInsert = await insertTelemetry("bridge_tasks", {
    command_ref: typeof commandId === "string" ? commandId : null,
    task_type: TASK_TYPE,
    task_prompt: taskPrompt,
    target: PROJECT_ID,
    priority: body.priority ?? "high",
    state: blockedReason ? "blocked" : "queued",
    approved,
    safe,
    created_at: now
  });

  const bridgeState = await upsertBridgeState(
    operation,
    {
      project_id: PROJECT_ID,
      operation,
      request_payload: body.requestPayload ?? {},
      approved,
      safe,
      queued_at: now
    },
    blockedReason ? "blocked" : "queued"
  );

  let blockerInsert: unknown = null;
  if (blockedReason) {
    const taskId = taskInsert.ok ? (taskInsert.rows?.[0] as Record<string, unknown> | undefined)?.id ?? null : null;
    blockerInsert = await insertTelemetry("bridge_blockers", {
      task_ref: typeof taskId === "string" ? taskId : null,
      blocker: blockedReason,
      state: "open",
      created_at: now
    });
  }

  return NextResponse.json({
    ok: true,
    projectId: PROJECT_ID,
    source: BRIDGE_SOURCE,
    commandInsert,
    taskInsert,
    bridgeState,
    blockerInsert
  });
}
