/**
 * SENTINEL — Next.js App Router Catch-All Route
 * Path: src/app/api/sentinel/[...path]/route.ts
 *
 * Handles all /api/sentinel/* sub-routes:
 *   GET  /api/sentinel/health
 *   GET  /api/sentinel/score
 *   GET  /api/sentinel/issues
 *   GET  /api/sentinel/remediation/queue
 *   GET  /api/sentinel/approval/queue
 *   GET  /api/sentinel/evidence
 *   POST /api/sentinel/score/run
 *   POST /api/sentinel/approval/request
 *   POST /api/sentinel/evidence/write
 *
 * Risk level: L0 (GETs) / L1 (scoring) / L2 (patch-planning)
 * PRODUCTION MUTATION: NEVER — enforced by type system
 */

import { NextRequest, NextResponse } from 'next/server';
import { collectAllEvidence } from '../../../../lib/sentinel/collectors';
import { runSentinelScore } from '../../../../lib/sentinel/scorer';
import { writeSentinelReceipt, enforceRiskGate } from '../../../../lib/sentinel/lib';

/* ---------- in-memory stores (until L4-approved Supabase tables) ---------- */
const scoreRuns: unknown[]   = [];
const receiptLog: unknown[]  = [];

/* ─── GET handler ────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const sub = (path ?? []).join('/');

  /* /api/sentinel/health */
  if (sub === 'health' || sub === '') {
    return NextResponse.json({
      status: 'ok',
      sentinel_version: '1.0.0',
      run_count: scoreRuns.length,
      receipt_count: receiptLog.length,
      production_mutated: false,
      timestamp: new Date().toISOString(),
      available_routes: {
        'GET  /api/sentinel/health':             'Sentinel health check',
        'GET  /api/sentinel/score':              'Latest score run result',
        'GET  /api/sentinel/issues':             'All findings from latest run',
        'GET  /api/sentinel/remediation/queue':  'Auto-fix eligible issues (L1/L2)',
        'GET  /api/sentinel/approval/queue':     'Issues requiring human approval (L3+)',
        'GET  /api/sentinel/evidence':           'Last 20 evidence receipts',
        'POST /api/sentinel/score/run':          'Collect live evidence + score',
        'POST /api/sentinel/approval/request':   'Submit approval request',
        'POST /api/sentinel/evidence/write':     'Manually write an evidence receipt',
      },
    });
  }

  /* /api/sentinel/score */
  if (sub === 'score') {
    const latest = scoreRuns[scoreRuns.length - 1] as Record<string,unknown> | undefined;
    if (!latest) {
      return NextResponse.json({
        message: 'No score run yet. POST to /api/sentinel/score/run to trigger.',
        fixture_baseline: 39,
        forensic_baseline: 35,
      });
    }
    return NextResponse.json(latest);
  }

  /* /api/sentinel/issues */
  if (sub === 'issues') {
    const latest = scoreRuns[scoreRuns.length - 1] as Record<string,unknown> | undefined;
    return NextResponse.json({
      findings:    latest?.findings ?? [],
      total:       (latest?.findings as unknown[] | undefined)?.length ?? 0,
      run_id:      latest?.runId ?? null,
      retrieved_at: new Date().toISOString(),
    });
  }

  /* /api/sentinel/remediation/queue */
  if (sub === 'remediation/queue') {
    const latest = scoreRuns[scoreRuns.length - 1] as Record<string,unknown> | undefined;
    return NextResponse.json({
      autoFixQueue: latest?.autoFixQueue ?? [],
      count: (latest?.autoFixQueue as unknown[] | undefined)?.length ?? 0,
      risk_levels_included: ['L1', 'L2'],
      note: 'These issues can be patched in a branch without human approval.',
    });
  }

  /* /api/sentinel/approval/queue */
  if (sub === 'approval/queue') {
    const latest = scoreRuns[scoreRuns.length - 1] as Record<string,unknown> | undefined;
    return NextResponse.json({
      approvalRequired: latest?.approvalRequired ?? [],
      count: (latest?.approvalRequired as unknown[] | undefined)?.length ?? 0,
      risk_levels_included: ['L3', 'L4', 'L5'],
      note: 'These issues require explicit Jeremy approval before any action.',
    });
  }

  /* /api/sentinel/evidence */
  if (sub === 'evidence') {
    return NextResponse.json({
      receipts: receiptLog.slice(-20),
      total_receipts: receiptLog.length,
      production_mutated: false,
      note: 'Last 20 sentinel receipts. File-based until Supabase tables approved (L4).',
    });
  }

  return NextResponse.json({ error: 'Unknown sentinel route', sub }, { status: 404 });
}

/* ─── POST handler ───────────────────────────────────────────────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const sub = (path ?? []).join('/');

  /* POST /api/sentinel/score/run */
  if (sub === 'score/run' || sub === 'score') {
    const gate = enforceRiskGate('L1', 'sentinel_score_run');
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason }, { status: 403 });
    }

    try {
      const evidence   = await collectAllEvidence();
      const scoreRun   = await runSentinelScore(evidence);

      scoreRuns.push(scoreRun);
      if (scoreRuns.length > 50) scoreRuns.shift();

      const receipt = writeSentinelReceipt(
        scoreRun.runId,
        'sentinel_score_run',
        'L1',
        'success',
        `Collected ${evidence.length} sources. Score: ${scoreRun.totalScore}/100. ` +
        `${scoreRun.findings.length} findings. ${scoreRun.autoFixQueue.length} auto-fixable.`,
      );
      receiptLog.push(receipt);

      return NextResponse.json({
        runId:                  scoreRun.runId,
        totalScore:             scoreRun.totalScore,
        fixture_baseline:       39,
        forensic_baseline:      35,
        delta_from_fixture:     scoreRun.totalScore - 39,
        timestamp:              scoreRun.timestamp,
        productionMutated:      false,
        domainSummary: scoreRun.domains.map(d => ({
          domain:     d.domain,
          score:      d.score,
          issueCount: d.issues.length,
        })),
        findingCount:          scoreRun.findings.length,
        autoFixCount:          scoreRun.autoFixQueue.length,
        approvalRequiredCount: scoreRun.approvalRequired.length,
        receipt:               receipt.receiptId,
        evidenceSources: evidence.map(e => ({
          source:  e.source,
          success: e.success,
          error:   e.error,
        })),
        p0Issues: scoreRun.findings
          .filter(f => f.severity === 'P0')
          .map(f => ({ title: f.title, riskLevel: f.riskLevel, autoFixEligible: f.autoFixEligible })),
        nextStep: scoreRun.autoFixQueue.length > 0
          ? `${scoreRun.autoFixQueue.length} issue(s) eligible for L1/L2 branch-safe auto-fix.`
          : 'Review approval queue for L3+ issues.',
      });
    } catch (err) {
      const receipt = writeSentinelReceipt(
        `error_${Date.now()}`, 'sentinel_score_run', 'L1', 'blocked', String(err),
      );
      receiptLog.push(receipt);
      return NextResponse.json({ error: String(err), receipt: receipt.receiptId }, { status: 500 });
    }
  }

  /* POST /api/sentinel/approval/request */
  if (sub === 'approval/request') {
    const body   = await req.json().catch(() => ({})) as Record<string,unknown>;
    const receipt = writeSentinelReceipt(
      String(body.runId ?? `manual_${Date.now()}`),
      `approval_request: ${body.action ?? 'unknown'}`,
      (body.riskLevel as 'L4') ?? 'L4',
      'pending_approval',
      `Approval requested for: ${body.title ?? 'Unknown'}. ${body.description ?? ''}`,
      body.rollbackPlan ? String(body.rollbackPlan) : undefined,
    );
    receiptLog.push(receipt);
    return NextResponse.json({
      message: 'Approval request recorded. Notify Jeremy via WhatsApp for L4/L5.',
      receipt,
      productionMutated: false,
      whatsappMessage:
        `🔐 SENTINEL APPROVAL REQUEST\n` +
        `Action: ${body.title}\nRisk: ${body.riskLevel}\n` +
        `Rollback: ${body.rollbackPlan}\nReceipt: ${receipt.receiptId}\n\nReply APPROVE or REJECT`,
    });
  }

  /* POST /api/sentinel/evidence/write */
  if (sub === 'evidence/write') {
    const body   = await req.json().catch(() => ({})) as Record<string,unknown>;
    const receipt = writeSentinelReceipt(
      String(body.runId ?? `manual_${Date.now()}`),
      String(body.action ?? 'manual_evidence_write'),
      (body.riskLevel as 'L1') ?? 'L1',
      (body.result  as 'success') ?? 'success',
      String(body.evidence ?? 'Manual evidence write'),
      body.rollbackPlan ? String(body.rollbackPlan) : undefined,
    );
    receiptLog.push(receipt);
    return NextResponse.json({ receiptId: receipt.receiptId, receipt, productionMutated: false });
  }

  return NextResponse.json({ error: 'Unknown sentinel POST route', sub }, { status: 404 });
}
