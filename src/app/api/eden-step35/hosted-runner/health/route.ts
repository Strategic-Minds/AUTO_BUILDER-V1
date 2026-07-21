import { NextResponse } from 'next/server';
import { hostedRunnerStatus } from '@/lib/eden-step35/hosted-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(hostedRunnerStatus());
}
