import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://prhppuuwcnmfdhwsagug.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function getCronToken() {
  return process.env.APEX_CRON_TOKEN ?? process.env.CRON_SECRET ?? '';
}

export function requireApexCron(request: Request, route: string) {
  const expected = getCronToken();

  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        route,
        protected: true,
        error: 'APEX cron token is not configured',
        required_env: 'APEX_CRON_TOKEN or CRON_SECRET',
      },
      { status: 503 },
    );
  }

  const authorization = request.headers.get('authorization') ?? '';
  if (authorization !== `Bearer ${expected}`) {
    return NextResponse.json(
      {
        ok: false,
        route,
        protected: true,
        error: 'Unauthorized APEX cron request',
      },
      { status: 401 },
    );
  }

  return null;
}

export function getMcpUrl(request: Request) {
  const configured = process.env.AUTO_BUILDER_MCP_URL;
  if (configured) return configured;

  return `${new URL(request.url).origin}/api/mcp-extended`;
}

export async function callMcpTool(request: Request, name: string, args: Record<string, unknown> = {}) {
  const response = await fetch(getMcpUrl(request), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });

  const body = await response.json().catch(() => null);
  return {
    ok: response.ok && !body?.error,
    status: response.status,
    result: body?.result ?? null,
    error: body?.error ?? null,
  };
}

export async function postSupabase(table: string, data: Record<string, unknown>) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 0, skipped: 'missing_supabase_service_role_key' };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });

  return { ok: response.ok, status: response.status };
}

export async function getSupabase(path: string) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 0, data: null, skipped: 'missing_supabase_service_role_key' };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export async function sendWhatsApp(body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? '';
  const authToken = process.env.TWILIO_API_SECRET ?? '';
  const from = process.env.TWILIO_WA_FROM ?? 'whatsapp:+15559730487';
  const to = process.env.JEREMY_WA ?? 'whatsapp:+17722090266';

  if (!accountSid || !authToken) {
    return { ok: false, status: 0, skipped: 'missing_twilio_config' };
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
  });

  return { ok: response.ok, status: response.status };
}
