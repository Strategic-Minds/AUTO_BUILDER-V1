import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_OPERATOR_PATH = '/api/agent-operator';

function getOperatorToken() {
  return process.env.AGENT_OPERATOR_TOKEN
    ?? process.env.AUTO_BUILDER_OPERATOR_TOKEN
    ?? process.env.AUTO_BUILDER_BRIDGE_TOKEN
    ?? process.env.BRIDGE_SECRET
    ?? process.env.BRIDGE_API_KEY
    ?? process.env.ADMIN_API_TOKEN
    ?? '';
}

function requestHasToken(request: NextRequest, expected: string) {
  const candidates = [
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    request.headers.get('x-agent-operator-token'),
    request.headers.get('x-auto-builder-token'),
    request.headers.get('x-bridge-key'),
    request.headers.get('x-api-key'),
  ];

  return candidates.some((candidate) => candidate === expected);
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== PROTECTED_OPERATOR_PATH || request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const expected = getOperatorToken();
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        route: 'agent-operator',
        protected: true,
        error: 'Operator token is not configured',
      },
      { status: 503 }
    );
  }

  if (!requestHasToken(request, expected)) {
    return NextResponse.json(
      {
        ok: false,
        route: 'agent-operator',
        protected: true,
        error: 'Unauthorized agent operator request',
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/agent-operator'],
};
