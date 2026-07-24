import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export type InternalAuthorizationResult = {
  ok: boolean;
  http_status: number;
  scope: string;
  reason: string;
  token_source: 'authorization' | 'x-internal-token' | 'x-auto-builder-token' | 'missing';
};

type TokenSource = InternalAuthorizationResult['token_source'];

function readToken(request: NextRequest): { token: string; source: TokenSource } {
  const authorization = request.headers.get('authorization')?.trim() ?? '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return {
      token: authorization.slice('Bearer '.length).trim(),
      source: 'authorization',
    };
  }

  const internalToken = request.headers.get('x-internal-token')?.trim();
  if (internalToken) {
    return { token: internalToken, source: 'x-internal-token' };
  }

  const autoBuilderToken = request.headers.get('x-auto-builder-token')?.trim();
  if (autoBuilderToken) {
    return { token: autoBuilderToken, source: 'x-auto-builder-token' };
  }

  return { token: '', source: 'missing' };
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function configuredTokens(): string[] {
  return [
    process.env.AUTO_BUILDER_INTERNAL_TOKEN,
    process.env.INTERNAL_API_TOKEN,
    process.env.CRON_SECRET,
  ].filter((value): value is string => Boolean(value?.trim()));
}

function scopeAllowed(requiredScope: string): boolean {
  const configuredScopes = process.env.AUTO_BUILDER_INTERNAL_SCOPES
    ?.split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!configuredScopes?.length) return true;
  return configuredScopes.includes('*') || configuredScopes.includes(requiredScope);
}

export function authorizeInternalRequest(
  request: NextRequest,
  requiredScope: string,
): InternalAuthorizationResult {
  const tokens = configuredTokens();

  if (tokens.length === 0) {
    return {
      ok: false,
      http_status: 503,
      scope: requiredScope,
      reason: 'Internal API token is not configured.',
      token_source: 'missing',
    };
  }

  if (!scopeAllowed(requiredScope)) {
    return {
      ok: false,
      http_status: 403,
      scope: requiredScope,
      reason: 'Required internal scope is not enabled.',
      token_source: 'missing',
    };
  }

  const { token, source } = readToken(request);
  const authorized = Boolean(token) && tokens.some((candidate) => constantTimeEqual(token, candidate));

  return {
    ok: authorized,
    http_status: authorized ? 200 : 401,
    scope: requiredScope,
    reason: authorized ? 'Internal request authorized.' : 'Invalid or missing internal token.',
    token_source: source,
  };
}
