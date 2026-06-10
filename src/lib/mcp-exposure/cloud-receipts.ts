type ReceiptInput = {
  kind: string;
  operation: string;
  riskClass?: number;
  mutation?: boolean;
  target?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  nextAction?: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceRoleKey, ready: Boolean(url && serviceRoleKey) };
}

export function makeCloudReceipt(input: ReceiptInput) {
  const createdAt = new Date().toISOString();
  return {
    id: `mcp-${createdAt.replace(/[-:.TZ]/g, "")}-${crypto.randomUUID()}`,
    kind: input.kind,
    created_at: createdAt,
    actor: "AUTO_BUILDER_CLOUD",
    operation: input.operation,
    risk_class: input.riskClass ?? 1,
    approval_state: (input.riskClass ?? 1) <= 1 && !input.mutation ? "not_required" : "pending",
    mutation: Boolean(input.mutation),
    target: input.target ?? {},
    payload: input.payload ?? {},
    result: input.result ?? {},
    rollback_ref: {
      strategy: input.mutation
        ? "Require approval-specific rollback plan before execution."
        : "Supersede with a newer cloud receipt if exposure changes."
    },
    next_action: input.nextAction ?? ""
  };
}

export async function writeCloudReceipt(receipt: Record<string, unknown>) {
  const { url, serviceRoleKey, ready } = getSupabaseConfig();
  if (!ready) {
    return {
      ok: false,
      status: "blocked_missing_cloud_receipt_store",
      reason: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for cloud-only durable receipts.",
      noLocalFallback: true,
      receipt
    };
  }

  const response = await fetch(`${url}/rest/v1/runtime_telemetry_events`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey!,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({
      telemetry_key: String(receipt.id),
      event_status: String((receipt.result as { status?: string })?.status ?? "recorded"),
      event_payload: receipt,
      created_at: receipt.created_at
    })
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return {
    ok: response.ok,
    status: response.ok ? "cloud_receipt_persisted" : "cloud_receipt_failed",
    httpStatus: response.status,
    receipt,
    body
  };
}
