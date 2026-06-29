import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, mode: 'dry_run', receipt_required: true, gated: true });
}

export async function POST() {
  return NextResponse.json({ ok: false, mode: 'blocked_without_operator_approval', receipt_required: true }, { status: 409 });
}
