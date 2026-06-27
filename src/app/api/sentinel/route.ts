/**
 * AUTO_BUILDER SENTINEL — API Route
 * Path: src/app/api/sentinel/route.ts
 *
 * GPT-callable scoring + evidence + remediation queue endpoints.
 * ALL GET routes are L0 (read-only). POST scoring is L1 (sandbox write).
 * PRODUCTION MUTATION: NEVER.
 */

import { NextRequest, NextResponse } from 'next/server';
import { collectAllEvidence } from '../../../lib/sentinel/collectors';
import { runSentinelScore } from '../../../lib/sentinel/scorer';
import { writeSentinelReceipt, enforceRiskGate } from '../../../lib/sentinel/lib';

// In-memory receipt store (until Supabase sentinel tables are approved)
const receiptStore: unknown[] = [];
const runStore: unknown[] = [];

// ─── GET /api/sentinel/score — Return latest cached score ─────────────────────
// ─── POST /api/sentinel/score/run — Collect live evidence + score ─────────────

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const path = pathname.replace('/api/sentinel', '');

  // GET /api/sentinel/score — latest run
  if (path === '/score' || path === '') {
    const latest = runStore[runStore.length - 1];
    if (!latest) {
      return NextResponse.json({
        message: 'No score run yet. POST to /api/sentinel/score/run to trigger.',
        sentinel_version: '1.0.0',
        docs: {
          'POST /api/sentinel/score/run': 'Collect live evidence and score',
          'GET /api/sentinel/issues': 'List all findings',
          'GET /api/sentinel/remediation/queue': 'Auto-fix eligible issues',
          'GET /api/sentinel/approval/queue': 'Issues requiring human approval',
          'GET /api/sentinel/evidence': 'Raw evidence from all collectors',
        }
      });
    }
    return NextResponse.json(latest);
  }

  // GET /api/sentinel/issues
  if (path === '/issues') {
    const latest = runStore[runStore.length - 1] as { findings?: unknown[] } | undefined;
    return NextResponse.json({
      findings: latest?.findings ?? [],
      total: (latest?.findings as unknown[])?.length ?? 0,
    });
  }

  // GET /api/sentinel/remediation/queue
  if (path === '/remediation/queue') {
    const latest = runStore[runStore.length - 1] as { autoFixQueue?: unknown[] } | undefined;
    return NextResponse.json({
      autoFixQueue: latest?.autoFixQueue ?? [],
      count: (latest?.autoFixQueue as unknown[])?.length ?? 0,
      note: 'L1/L2 issues only — eligible for branch-safe patches without approval',
    });
  }

  // GET /api/sentinel/approval/queue
  if (path === '/approval/queue') {
    const latest = runStore[runStore.length - 1] as { approvalRequired?: unknown[] } | undefined;
    return NextResponse.json({
      approvalRequired: latest?.approvalRequired ?? [],
      count: (latest?.approvalRequired as unknown[])?.length ?? 0,
      note: 'L3/L4/L5 issues — require explicit human approval before action',
    });
  }

  // GET /api/sentinel/evidence
  if (path === '/evidence') {
    return NextResponse.json({
      receipts: receiptStore.slice(-20),
      note: 'Last 20 sentinel receipts. No production mutation recorded.',
    });
  }

  // GET /api/sentinel/health
  if (path === '/health') {
    return NextResponse.json({
      status: 'ok',
      sentinel_version: '1.0.0',
      run_count: runStore.length,
      receipt_count: receiptStore.length,
      production_mutated: false,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: 'Unknown sentinel route', path }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const path = pathname.replace('/api/sentinel', '');

  // POST /api/sentinel/score/run — Full evidence collection + scoring
  if (path === '/score/run' || path === '/score') {
    // L1 action: runs in memory only, no production mutation
    const gate = enforceRiskGate('L1', 'sentinel_score_run');
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason }, { status: 403 });
    }

    try {
      // Collect all evidence (L0 — read-only)
      const evidence = await collectAllEvidence();

      // Score from evidence (L1 — in-memory write only)
      const scoreRun = await runSentinelScore(evidence);

      // Store run
      runStore.push(scoreRun);
      if (runStore.length > 50) runStore.shift(); // cap memory

      // Write receipt (L1 — sandbox only)
      const receipt = writeSentinelReceipt(
        scoreRun.runId,
        'sentinel_score_run',
        'L1',
        'success',
        `Collected ${evidence.length} evidence sources. Score: ${scoreRun.totalScore}/100. ${scoreRun.findings.length} findings.`,
      );
      receiptStore.push(receipt);

      return NextResponse.json({
        runId: scoreRun.runId,
        totalScore: scoreRun.totalScore,
        timestamp: scoreRun.timestamp,
        domainSummary: scoreRun.domains.map(d => ({
          domain: d.domain,
          score: d.score,
          issueCount: d.issues.length,
        })),
        findingCount: scoreRun.findings.length,
        autoFixCount: scoreRun.autoFixQueue.length,
        approvalRequiredCount: scoreRun.approvalRequired.length,
        receipt: receipt.receiptId,
        productionMutated: false,
        evidenceSources: evidence.map(e => ({ source: e.source, success: e.success })),
        p0Issues: scoreRun.findings.filter(f => f.severity === 'P0').map(f => ({
          title: f.title, riskLevel: f.riskLevel, autoFixEligible: f.autoFixEligible
        })),
        nextStep: scoreRun.autoFixQueue.length > 0
          ? `${scoreRun.autoFixQueue.length} issues eligible for branch-safe auto-fix. POST /api/sentinel/patch/run to generate patches.`
          : 'No auto-fix eligible issues. Review approval queue.',
      });
    } catch (error) {
      const receipt = writeSentinelReceipt('error', 'sentinel_score_run', 'L1', 'blocked', String(error));
      receiptStore.push(receipt);
      return NextResponse.json({ error: String(error), receipt: receipt.receiptId }, { status: 500 });
    }
  }

  // POST /api/sentinel/approval/request — Create approval request (L0 write to receipt store)
  if (path === '/approval/request') {
    const body = await req.json().catch(() => ({}));
    const receipt = writeSentinelReceipt(
      body.runId ?? `manual_${Date.now()}`,
      `approval_request: ${body.action ?? 'unknown'}`,
      body.riskLevel ?? 'L4',
      'pending_approval',
      `Approval requested for: ${body.title ?? 'Unknown action'}. Risk: ${body.riskLevel}. ${body.description ?? ''}`,
      body.rollbackPlan,
    );
    receiptStore.push(receipt);
    return NextResponse.json({
      message: 'Approval request recorded. Notify Jeremy via WhatsApp for L4/L5 actions.',
      receipt,
      whatsappMessage: `🚨 APEX APPROVAL NEEDED\nAction: ${body.title}\nRisk: ${body.riskLevel}\nReceipt: ${receipt.receiptId}\nApprove or reject?`,
    });
  }

  return NextResponse.json({ error: 'Unknown sentinel POST route', path }, { status: 404 });
}
