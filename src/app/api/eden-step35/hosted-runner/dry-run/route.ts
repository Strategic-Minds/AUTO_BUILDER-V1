import { NextResponse } from 'next/server';
import { expandedStep35Rows, validateRows } from '@/lib/eden-step35/hosted-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = expandedStep35Rows();
  const errors = validateRows(rows);
  return NextResponse.json({
    status: errors.length ? 'blocked' : 'validated_dry_run',
    mutation_performed: false,
    row_count: rows.length,
    errors,
    rows
  }, { status: errors.length ? 422 : 200 });
}
