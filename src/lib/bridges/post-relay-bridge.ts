export type PostRelayRequest = {
  token?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  approved?: boolean;
  timeoutMs?: number;
};

export type PostRelayResult = {
  status: "ok" | "blocked" | "error";
  receipt: Record<string, unknown>;
};

const DEFAULT_ALLOWED_METHODS = ["POST", "PUT", "PATCH", "DELETE", "GET"];
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export async function runPostRelayBridge(request: PostRelayRequest): Promise<PostRelayResult> {
  const gate = requirePostRelayEnabled(request);
  if (gate) return gate;

  try {
    const url = requireUrl(request.url);
    const method = (request.method ?? "POST").toUpperCase();
    const allowedMethods = parseList(process.env.POST_RELAY_ALLOWED_METHODS, DEFAULT_ALLOWED_METHODS);
    if (!allowedMethods.includes(method)) {
      return blocked({ reason: "HTTP method is not allowed", method, allowedMethods });
    }

    const allowedHosts = parseList(process.env.POST_RELAY_ALLOWED_HOSTS, []);
    const allowAll = process.env.POST_RELAY_ALLOW_ALL_HOSTS === "true";
    if (!allowAll && !allowedHosts.includes(url.hostname)) {
      return blocked({ reason: "Target host is not allowlisted", host: url.hostname, requiredEnv: "POST_RELAY_ALLOWED_HOSTS" });
    }

    if (BLOCKED_HOSTS.has(url.hostname) && process.env.POST_RELAY_ALLOW_PRIVATE_HOSTS !== "true") {
      return blocked({ reason: "Private/local target host is blocked by default", host: url.hostname });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 120000);
    const response = await fetch(url, {
      method,
      headers: sanitizeHeaders(request.headers ?? {}),
      body: method === "GET" ? undefined : serializeBody(request.body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await response.text();
    return ok({
      url: redactUrl(url),
      method,
      statusCode: response.status,
      ok: response.ok,
      responseHeaders: pickResponseHeaders(response.headers),
      bodyPreview: text.slice(0, 20000),
      bodyTruncated: text.length > 20000
    });
  } catch (error) {
    return {
      status: "error",
      receipt: baseReceipt({ error: error instanceof Error ? error.message : String(error) })
    };
  }
}

function requirePostRelayEnabled(request: PostRelayRequest): PostRelayResult | null {
  if (process.env.AUTO_BUILDER_POST_RELAY_ENABLED !== "true") {
    return blocked({
      reason: "AUTO_BUILDER_POST_RELAY_ENABLED is not true",
      requiredEnv: ["AUTO_BUILDER_POST_RELAY_ENABLED", "AUTO_BUILDER_POST_RELAY_TOKEN", "POST_RELAY_ALLOWED_HOSTS"]
    });
  }

  const expectedToken = process.env.AUTO_BUILDER_POST_RELAY_TOKEN ?? process.env.AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN;
  if (!expectedToken || request.token !== expectedToken) {
    return blocked({ reason: "POST relay token missing or invalid", requiredEnv: ["AUTO_BUILDER_POST_RELAY_TOKEN"] });
  }

  if (request.approved !== true) {
    return blocked({ reason: "Explicit approval is required for POST relay", requiredField: "approved: true" });
  }

  return null;
}

function requireUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Missing url");
  const url = new URL(value);
  if (url.protocol !== "https:" && process.env.POST_RELAY_ALLOW_HTTP !== "true") {
    throw new Error("Only HTTPS targets are allowed by default");
  }
  return url;
}

function serializeBody(body: unknown) {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

function sanitizeHeaders(headers: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!key || typeof value !== "string") continue;
    out[key] = value;
  }
  if (!Object.keys(out).some((key) => key.toLowerCase() === "content-type")) {
    out["Content-Type"] = "application/json";
  }
  return out;
}

function pickResponseHeaders(headers: Headers) {
  const names = ["content-type", "x-request-id", "x-vercel-id", "x-ratelimit-remaining"];
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = headers.get(name);
    if (value) out[name] = value;
  }
  return out;
}

function parseList(value: string | undefined, fallback: string[]) {
  if (!value) return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function redactUrl(url: URL) {
  const copy = new URL(url.toString());
  copy.username = "";
  copy.password = "";
  return copy.toString();
}

function ok(receipt: Record<string, unknown>): PostRelayResult {
  return { status: "ok", receipt: baseReceipt(receipt) };
}

function blocked(receipt: Record<string, unknown>): PostRelayResult {
  return { status: "blocked", receipt: baseReceipt(receipt) };
}

function baseReceipt(receipt: Record<string, unknown>) {
  return { generatedAt: new Date().toISOString(), ...receipt };
}
