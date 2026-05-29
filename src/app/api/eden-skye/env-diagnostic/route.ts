import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EDEN_TABLES = [
  "eden_persona_assets",
  "eden_prompt_bank",
  "eden_content_queue",
  "eden_approval_events",
  "eden_signal_logs"
] as const;

function firstPresent(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.length > 0) || "";
}

function supabaseUrl() {
  return firstPresent(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.EDEN_SKYE_SUPABASE_URL
  );
}

function supabaseKey() {
  return firstPresent(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.EDEN_SKYE_SUPABASE_ANON_KEY
  );
}

function sourceFlags() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    EDEN_SKYE_SUPABASE_URL: Boolean(process.env.EDEN_SKYE_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    EDEN_SKYE_SUPABASE_ANON_KEY: Boolean(process.env.EDEN_SKYE_SUPABASE_ANON_KEY),
    SOL_READ_ONLY_MODE: process.env.SOL_READ_ONLY_MODE || "unset",
    SOL_REQUIRE_APPROVALS: process.env.SOL_REQUIRE_APPROVALS || "unset"
  };
}

function parseTarget(url: string) {
  if (!url) return { configured: false, host: null, ref: null };

  try {
    const parsed = new URL(url);
    const host = parsed.host;
    const ref = host.endsWith(".supabase.co") ? host.replace(".supabase.co", "") : null;
    return { configured: true, host, ref };
  } catch {
    return { configured: true, host: "invalid-url", ref: null };
  }
}

async function tableVisibility(table: string) {
  const url = supabaseUrl();
  const key = supabaseKey();

  if (!url || !key) {
    return { table, visible: false, count: null, error: "Supabase URL or key is missing." };
  }

  const client = createClient(url, key);
  const { count, error } = await client.from(table).select("id", { count: "exact", head: true });

  return {
    table,
    visible: !error,
    count: error ? null : count,
    error: error?.message || null
  };
}

export async function GET() {
  const url = supabaseUrl();
  const target = parseTarget(url);
  const visibility = await Promise.all(EDEN_TABLES.map((table) => tableVisibility(table)));
  const expectedSandboxRef = "ezoxmpyhjdjjnacjfjzs";

  return NextResponse.json({
    ok: true,
    target,
    expectedSandboxRef,
    matchesExpectedSandbox: target.ref === expectedSandboxRef,
    envPresence: sourceFlags(),
    edenTables: visibility,
    secretsExposed: false
  });
}
