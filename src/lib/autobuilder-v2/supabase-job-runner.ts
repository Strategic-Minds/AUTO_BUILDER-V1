type JsonRecord = Record<string, unknown>;

type SupabaseMode = "read" | "dry_run" | "draft" | "execute" | "rollback";
type SupabaseWriteOperation = "insert" | "upsert" | "update" | "delete";
type SupabaseExecuteOperation = "status" | "rpc" | "invoke_edge_function" | "execute_sql" | "apply_migration" | "deploy_edge_function";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const autobuilderBridgeKey = process.env.AUTOBUILDER_BRIDGE_KEY || "";
const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF || "prhppuuwcnmfdhwsagug";
const sqlExecutorFunction = process.env.SUPABASE_SQL_EXECUTOR_FUNCTION || "";

const knownAutoBuilderTables = [
  "agent_heartbeats",
  "queue_metrics",
  "execution_traces",
  "playwright_sessions",
  "model_invocations",
  "rollback_events",
  "worker_states",
  "bridge_commands",
  "bridge_tasks",
  "bridge_claims",
  "bridge_evidence",
  "bridge_blockers",
  "bridge_next_prompts",
  "bridge_connector_actions",
  "approval_queue",
  "escalation_events",
  "rollback_requests",
  "autobuilder_bridge_state",
  "queue_jobs",
  "runtime_telemetry_events",
  "connector_receipts"
] as const;

const destructiveOperations = new Set<SupabaseWriteOperation | SupabaseExecuteOperation>([
  "delete",
  "execute_sql",
  "apply_migration",
  "deploy_edge_function"
]);

const secretKeyPattern = /authorization|bearer|connection[_-]?string|password|private[_-]?key|secret|token|api[_-]?key|service[_-]?role/i;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function boolValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeMode(value: unknown, fallback: SupabaseMode = "dry_run"): SupabaseMode {
  return typeof value === "string" && ["read", "dry_run", "draft", "execute", "rollback"].includes(value)
    ? (value as SupabaseMode)
    : fallback;
}

function sanitize(value: unknown): unknown {
  const configuredSecrets = [supabaseAnonKey, supabaseServiceRoleKey, autobuilderBridgeKey]
    .filter((item) => item.length >= 8);

  if (typeof value === "string") return configuredSecrets.includes(value) ? "[redacted]" : value;
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      secretKeyPattern.test(key) ? "[redacted]" : sanitize(item)
    ])
  );
}

function tableName(input: JsonRecord): string {
  return stringValue(input.table) ?? stringValue(input.table_name) ?? "autobuilder_bridge_state";
}

function allowAnyTable(input: JsonRecord): boolean {
  const approvedActions = stringArray(input.approved_actions);
  return boolValue(input.allow_any_table) === true || approvedActions.includes("supabase_full_access");
}

function guardTable(input: JsonRecord) {
  const table = tableName(input);
  const known = knownAutoBuilderTables.some((item) => item === table);
  if (known || allowAnyTable(input)) return { ok: true as const, table };
  return {
    ok: false as const,
    table,
    reason: `Table ${table} is outside the known AUTO_BUILDER table allowlist. Pass allow_any_table=true or approved_actions=['supabase_full_access'] when this is intentional.`
  };
}

function hasApprovedAction(input: JsonRecord, acceptedActions: string[]) {
  const approvedActions = stringArray(input.approved_actions);
  return acceptedActions.some((action) => approvedActions.includes(action));
}

function approvalGate(input: JsonRecord, capability: "write" | "execute", operation: string) {
  const approved = boolValue(input.approved) === true;
  const approvedActions = capability === "write"
    ? ["supabase_write", "supabase_full_access", `supabase_${operation}`]
    : ["supabase_execute", "supabase_full_access", `supabase_${operation}`];
  const actionApproved = hasApprovedAction(input, approvedActions);
  const phrase = stringValue(input.approvalPhrase) ?? stringValue(input.approval_phrase);
  const destructive = destructiveOperations.has(operation as SupabaseWriteOperation | SupabaseExecuteOperation);
  const destructivePhraseOk = !destructive || phrase === "APPROVE SUPABASE EXECUTE";

  return {
    ok: approved && actionApproved && destructivePhraseOk,
    approved,
    actionApproved,
    destructive,
    destructivePhraseOk,
    required_actions: approvedActions,
    required_phrase: destructive ? "APPROVE SUPABASE EXECUTE" : undefined
  };
}

function configuredForServiceRole() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function configuredForRead() {
  return Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));
}

function restHeaders(prefer = "return=representation") {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    prefer
  };
}

function queryParams(input: JsonRecord) {
  const params = new URLSearchParams();
  params.set("select", stringValue(input.select) ?? "*");

  const limit = Number(input.limit ?? 50);
  if (Number.isFinite(limit)) params.set("limit", String(Math.min(Math.max(Math.floor(limit), 1), 500)));

  const order = stringValue(input.order);
  if (order) params.set("order", order);

  const filters = isRecord(input.filters) ? input.filters : isRecord(input.filter) ? input.filter : {};
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string") params.set(key, value);
    else if (typeof value === "number" || typeof value === "boolean") params.set(key, `eq.${value}`);
  }

  return params;
}

function receipt(input: JsonRecord, status: string) {
  return sanitize({
    required: true,
    system: "supabase",
    project_ref: supabaseProjectRef,
    status,
    requested_table: stringValue(input.table),
    requested_operation: stringValue(input.operation) ?? stringValue(input.action)
  });
}

function rollback(input: JsonRecord, status: string) {
  return sanitize({
    available: normalizeMode(input.mode) !== "read",
    status,
    table: stringValue(input.table),
    rollback_hint: "Use returned rows, filters, and receipt data to prepare a targeted rollback. Destructive rollback is never automatic."
  });
}

function outcome(input: JsonRecord, data: JsonRecord, status = "ok") {
  return sanitize({
    job_id: stringValue(input.job_id) ?? `supabase-${Date.now()}`,
    status,
    mode: normalizeMode(input.mode, "read"),
    action: stringValue(input.action) ?? stringValue(input.operation) ?? "supabase",
    target_system: "supabase",
    timestamp: new Date().toISOString(),
    data,
    receipt: receipt(input, status),
    rollback: rollback(input, normalizeMode(input.mode) === "read" ? "not_required_for_read" : "rollback_metadata_planned")
  });
}

async function restRequest(args: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  params?: URLSearchParams;
  payload?: unknown;
  prefer?: string;
}) {
  const url = new URL(`${supabaseUrl}/rest/v1/${args.path}`);
  if (args.params) {
    for (const [key, value] of args.params.entries()) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: args.method,
    headers: restHeaders(args.prefer),
    body: args.method === "GET" ? undefined : JSON.stringify(args.payload ?? {}),
    cache: "no-store"
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, rows: text ? JSON.parse(text) : null };
}

async function invokeEdgeFunction(functionName: string, payload: unknown) {
  const token = autobuilderBridgeKey || supabaseServiceRoleKey;
  if (!supabaseUrl || !token) {
    return {
      ok: false,
      mode: "dry_run",
      reason: "SUPABASE_URL plus AUTOBUILDER_BRIDGE_KEY or SUPABASE_SERVICE_ROLE_KEY must be configured to invoke an edge function."
    };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-bridge-key": token,
      "x-autobuilder-bridge-key": token,
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload ?? {}),
    cache: "no-store"
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, response: text ? JSON.parse(text) : null };
}

export function supabaseRuntimeStatus(input: JsonRecord = {}) {
  return outcome(input, {
    configured: configuredForRead(),
    service_role_configured: Boolean(supabaseServiceRoleKey),
    anon_key_configured: Boolean(supabaseAnonKey),
    bridge_key_configured: Boolean(autobuilderBridgeKey),
    project_ref: supabaseProjectRef,
    known_auto_builder_tables: knownAutoBuilderTables,
    capabilities: {
      read: "Supabase REST select with secret-redacted responses.",
      write: "Insert, upsert, update, and guarded delete through Supabase REST when mode=execute and approval gates pass.",
      execute: "RPC and edge function invocation; SQL/migration execution requires an approved executor function."
    },
    governance: {
      default_mode: "dry_run",
      write_requires: ["mode=execute", "approved=true", "approved_actions includes supabase_write or supabase_full_access"],
      execute_requires: ["mode=execute", "approved=true", "approved_actions includes supabase_execute or supabase_full_access"],
      destructive_phrase: "APPROVE SUPABASE EXECUTE",
      secrets_returned: false
    }
  }, "status_ready");
}

export async function supabaseRead(input: JsonRecord) {
  const guarded = guardTable(input);
  if (!guarded.ok) return outcome(input, { blocker: guarded.reason }, "blocked");

  if (!configuredForRead()) {
    return outcome(input, {
      dry_run_only: true,
      reason: "SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not configured.",
      would_read_table: guarded.table,
      query: Object.fromEntries(queryParams(input).entries())
    }, "dry_run_complete");
  }

  const response = await restRequest({ method: "GET", path: guarded.table, params: queryParams(input) });
  return outcome(input, {
    table: guarded.table,
    provider_result: response
  }, response.ok ? "read_complete" : "read_failed");
}

export async function supabaseWrite(input: JsonRecord) {
  const mode = normalizeMode(input.mode);
  const operation = (stringValue(input.operation) ?? "insert") as SupabaseWriteOperation;
  const guarded = guardTable(input);
  const payload = input.payload ?? input.data ?? {};
  const params = queryParams(input);
  params.delete("select");
  params.delete("limit");
  params.delete("order");

  if (!guarded.ok) return outcome(input, { blocker: guarded.reason }, "blocked");

  if (mode !== "execute") {
    return outcome(input, {
      dry_run_only: true,
      would_write_table: guarded.table,
      operation,
      payload: sanitize(payload),
      filters: Object.fromEntries(params.entries()),
      approval_required: true
    }, "dry_run_complete");
  }

  const approval = approvalGate(input, "write", operation);
  if (!approval.ok) {
    return outcome(input, {
      blocker: "Supabase write requires explicit approval metadata.",
      approval
    }, "blocked");
  }

  if (!configuredForServiceRole()) {
    return outcome(input, {
      blocker: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase writes."
    }, "blocked");
  }

  if ((operation === "update" || operation === "delete") && [...params.keys()].length === 0) {
    return outcome(input, {
      blocker: `${operation} requires at least one PostgREST filter to prevent broad mutation.`
    }, "blocked");
  }

  const method = operation === "update" ? "PATCH" : operation === "delete" ? "DELETE" : "POST";
  const prefer = operation === "upsert" ? "resolution=merge-duplicates,return=representation" : "return=representation";
  const onConflict = stringValue(input.on_conflict);
  if (operation === "upsert" && onConflict) params.set("on_conflict", onConflict);

  const response = await restRequest({ method, path: guarded.table, params, payload, prefer });
  return outcome(input, {
    table: guarded.table,
    operation,
    provider_result: response
  }, response.ok ? "write_complete" : "write_failed");
}

export async function supabaseExecute(input: JsonRecord) {
  const mode = normalizeMode(input.mode);
  const operation = (stringValue(input.operation) ?? "status") as SupabaseExecuteOperation;

  if (operation === "status") return supabaseRuntimeStatus({ ...input, mode: "read" });

  if (mode !== "execute") {
    return outcome(input, {
      dry_run_only: true,
      operation,
      function_name: stringValue(input.function_name),
      sql_provided: Boolean(stringValue(input.sql)),
      migration_name: stringValue(input.migration_name),
      approval_required: true
    }, "dry_run_complete");
  }

  const approval = approvalGate(input, "execute", operation);
  if (!approval.ok) {
    return outcome(input, {
      blocker: "Supabase execute requires explicit approval metadata.",
      approval
    }, "blocked");
  }

  if (operation === "rpc") {
    const functionName = stringValue(input.function_name);
    if (!functionName) return outcome(input, { blocker: "function_name is required for Supabase RPC execution." }, "blocked");
    if (!configuredForServiceRole()) return outcome(input, { blocker: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase RPC execution." }, "blocked");
    const response = await restRequest({ method: "POST", path: `rpc/${functionName}`, payload: input.payload ?? input.data ?? {} });
    return outcome(input, { operation, function_name: functionName, provider_result: response }, response.ok ? "execute_complete" : "execute_failed");
  }

  if (operation === "invoke_edge_function") {
    const functionName = stringValue(input.function_name) ?? "autobuilder-gpt-bridge";
    const response = await invokeEdgeFunction(functionName, input.payload ?? input.data ?? {});
    return outcome(input, { operation, function_name: functionName, provider_result: response }, response.ok ? "execute_complete" : "execute_failed");
  }

  if (operation === "execute_sql" || operation === "apply_migration") {
    const functionName = stringValue(input.function_name) ?? sqlExecutorFunction;
    if (!functionName) {
      return outcome(input, {
        blocker: "Raw SQL and migration execution require SUPABASE_SQL_EXECUTOR_FUNCTION or function_name. No direct SQL endpoint is exposed by Supabase REST.",
        operation,
        adapter_required: "Create and review a dedicated SQL executor edge function before live SQL or migration execution."
      }, "blocked");
    }
    const response = await invokeEdgeFunction(functionName, {
      action: operation,
      sql: stringValue(input.sql),
      migration_name: stringValue(input.migration_name),
      payload: input.payload ?? input.data ?? {},
      requested_by: stringValue(input.requested_by) ?? "auto-builder-mcp-supabase"
    });
    return outcome(input, { operation, function_name: functionName, provider_result: response }, response.ok ? "execute_complete" : "execute_failed");
  }

  return outcome(input, {
    blocker: "Edge function deployment requires the Supabase Management API and is intentionally not wired to chat-triggered execution.",
    operation,
    adapter_required: "Use a reviewed CI/deployment workflow for deploy_edge_function."
  }, "blocked");
}

export async function runSupabaseJob(input: JsonRecord) {
  const action = stringValue(input.action) ?? stringValue(input.operation) ?? "status";
  if (action === "read" || action === "supabase_read") return supabaseRead({ ...input, action: "supabase_read", mode: "read" });
  if (action === "write" || action === "insert" || action === "upsert" || action === "update" || action === "delete" || action === "supabase_write") {
    return supabaseWrite({ ...input, action: "supabase_write", operation: action === "supabase_write" ? input.operation : action });
  }
  return supabaseExecute({ ...input, action: "supabase_execute", operation: action === "supabase_execute" ? input.operation : action });
}
