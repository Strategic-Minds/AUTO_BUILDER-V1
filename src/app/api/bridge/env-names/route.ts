import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const expected = [
  "AUTO_BUILDER_BRIDGE_TOKEN",
  "AUTO_BUILDER_ROUTER_URL",
  "AUTO_BUILDER_GPT_BRIDGE_SECRET",
  "AUTO_BUILDER_ADMIN_WRITE_ENABLED",
  "CRON_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_BRIDGE_TABLE_ALLOWLIST",
  "SUPABASE_BRIDGE_RPC_ALLOWLIST",
  "VERCEL_OIDC_TOKEN",
  "AI_GATEWAY_API_KEY",
  "OPENAI_API_KEY",
  "GITHUB_TOKEN",
  "BROWSER_WORKER_TOKEN",
  "SHOPIFY_ADMIN_TOKEN",
  "STRIPE_SECRET_KEY",
  "SLACK_BOT_TOKEN"
];

const vercelInjectedPrefixes = ["VERCEL", "VERCEL_", "NEXT_RUNTIME"];

export async function GET() {
  const runtimeNames = Object.keys(process.env).sort();
  const vercelRuntimeNames = runtimeNames.filter((name) => vercelInjectedPrefixes.some((prefix) => name === prefix || name.startsWith(prefix)));

  return NextResponse.json({
    status: "ready",
    mutation: false,
    source: "vercel_runtime_process_env_names_only",
    warning: "This route never returns secret values. It only returns names and present/missing booleans.",
    expected: expected.map((name) => ({ name, present: Boolean(process.env[name]) })),
    vercelRuntimeNames,
    counts: {
      expected: expected.length,
      expectedPresent: expected.filter((name) => Boolean(process.env[name])).length,
      vercelRuntimeNames: vercelRuntimeNames.length
    }
  }, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "no-store"
    }
  });
}
