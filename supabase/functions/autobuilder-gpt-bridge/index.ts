import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Json = Record<string, unknown>;
type BridgeAction =
  | "status"
  | "create_connector_action"
  | "upsert_bridge_state"
  | "insert_telemetry"
  | "update_telemetry";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const bridgeKey = Deno.env.get("AUTOBUILDER_BRIDGE_KEY") || serviceRoleKey;
const projectRef = Deno.env.get("SUPABASE_PROJECT_REF") || "prhppuuwcnmfdhwsagug";

const TELEMETRY_TABLES = new Set([
  "bridge_commands",
  "bridge_tasks",
  "bridge_claims",
  "bridge_evidence",
  "bridge_blockers",
  "bridge_next_prompts",
  "bridge_connector_actions",
  "web_research_bridge",
  "social_media_bridge",
  "lead_generation_bridge",
  "financial_simulation_bridge",
  "shopify_commerce_bridge",
  "queue_control_events",
  "autobuilder_bridge_state"
]);

function json(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

function restHeaders() {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
    prefer: "return=representation"
  };
}

function isAuthorized(req: Request) {
  const xBridgeKey = req.headers.get("x-bridge-key");
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return Boolean(bridgeKey) && (xBridgeKey === bridgeKey || bearer === bridgeKey);
}

async function restSelect(path: string, searchParams: Record<string, string>) {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, { headers: restHeaders() });
  const text = await response.text();
  return { ok: response.ok, status: response.status, data: text ? JSON.parse(text) : null };
}

async function restInsert(path: string, payload: unknown) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "POST",
    headers: restHeaders(),
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, data: text ? JSON.parse(text) : null };
}

async function restPatch(path: string, payload: unknown, searchParams: Record<string, string>) {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    method: "PATCH",
    headers: restHeaders(),
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, data: text ? JSON.parse(text) : null };
}

async function getStatus() {
  const [actions, tasks, stateRows] = await Promise.all([
    restSelect("bridge_connector_actions", {
      select: "id,project_ref,connector,operation,action_status,target_ref,approved,safe,created_at,updated_at,completed_at,error_message",
      project_ref: `eq.${projectRef}`,
      order: "created_at.desc",
      limit: "20"
    }),
    restSelect("bridge_tasks", {
      select: "id,task_type,state,approved,safe,created_at",
      order: "created_at.desc",
      limit: "20"
    }),
    restSelect("autobuilder_bridge_state", {
      select: "id,scope,key,status,state,metadata,updated_at,last_read_at,last_write_at",
      order: "updated_at.desc",
      limit: "20"
    })
  ]);

  return {
    ok: actions.ok && tasks.ok && stateRows.ok,
    projectRef,
    actions,
    tasks,
    state: stateRows
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    return json(await getStatus());
  }

  if (!isAuthorized(req)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const body = (await req.json().catch(() => ({}))) as Json;
  const action = String(body.action ?? "status") as BridgeAction;
  const now = new Date().toISOString();

  if (action === "status") {
    return json(await getStatus());
  }

  if (action === "create_connector_action") {
    const result = await restInsert("bridge_connector_actions", {
      project_ref: String(body.projectRef ?? projectRef),
      connector: String(body.connector ?? "supabase"),
      operation: String(body.operation ?? "unspecified"),
      action_status: String(body.actionStatus ?? "pending"),
      target_ref: body.targetRef == null ? null : String(body.targetRef),
      request_payload: typeof body.requestPayload === "object" && body.requestPayload ? body.requestPayload : {},
      result_payload: typeof body.resultPayload === "object" && body.resultPayload ? body.resultPayload : null,
      error_message: body.errorMessage == null ? null : String(body.errorMessage),
      requested_by: body.requestedBy == null ? "autobuilder-gpt-bridge" : String(body.requestedBy),
      approved: body.approved === true,
      safe: body.safe === true,
      claimed_by: body.claimedBy == null ? null : String(body.claimedBy),
      claimed_at: body.claimedAt == null ? null : String(body.claimedAt),
      completed_at: body.completedAt == null ? null : String(body.completedAt),
      created_at: String(body.createdAt ?? now),
      updated_at: String(body.updatedAt ?? now)
    });
    return json({ ok: result.ok, action, result }, result.ok ? 200 : 400);
  }

  if (action === "upsert_bridge_state") {
    const scope = String(body.scope ?? "connector");
    const key = String(body.key ?? `supabase:${projectRef}`);
    const rowId = String(body.id ?? `${scope}:${key}`);
    const statePayload = typeof body.state === "object" && body.state ? body.state : {};
    const metadata = typeof body.metadata === "object" && body.metadata ? body.metadata : {};
    const result = await restInsert("autobuilder_bridge_state", {
      id: rowId,
      scope,
      key,
      status: String(body.status ?? "ready"),
      payload: statePayload,
      state: statePayload,
      metadata,
      last_read_at: body.lastReadAt == null ? null : String(body.lastReadAt),
      last_write_at: String(body.lastWriteAt ?? now),
      updated_at: String(body.updatedAt ?? now),
      created_at: String(body.createdAt ?? now)
    });

    if (!result.ok) {
      const update = await restPatch(
        "autobuilder_bridge_state",
        {
          scope,
          key,
          status: String(body.status ?? "ready"),
          payload: statePayload,
          state: statePayload,
          metadata,
          last_read_at: body.lastReadAt == null ? null : String(body.lastReadAt),
          last_write_at: String(body.lastWriteAt ?? now),
          updated_at: String(body.updatedAt ?? now)
        },
        { id: `eq.${rowId}` }
      );
      return json({ ok: update.ok, action, result: update }, update.ok ? 200 : 400);
    }

    return json({ ok: true, action, result }, 200);
  }

  if (action === "insert_telemetry") {
    const table = String(body.table ?? "");
    if (!TELEMETRY_TABLES.has(table)) {
      return json({ ok: false, error: "Unsupported telemetry table", table }, 400);
    }
    const result = await restInsert(table, typeof body.payload === "object" && body.payload ? body.payload : {});
    return json({ ok: result.ok, action, result }, result.ok ? 200 : 400);
  }

  if (action === "update_telemetry") {
    const table = String(body.table ?? "");
    const id = body.id == null ? null : String(body.id);
    if (!TELEMETRY_TABLES.has(table) || !id) {
      return json({ ok: false, error: "Unsupported telemetry update request", table, id }, 400);
    }
    const result = await restPatch(table, typeof body.payload === "object" && body.payload ? body.payload : {}, { id: `eq.${id}` });
    return json({ ok: result.ok, action, result }, result.ok ? 200 : 400);
  }

  return json({ ok: false, error: "Unsupported action", action }, 400);
});
