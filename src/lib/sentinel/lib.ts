/**
 * AUTO_BUILDER SENTINEL — Core Library
 * Self-hardening control layer for the AUTO_BUILDER system.
 * 
 * Risk gates:
 * L0 — read-only, fully automatic
 * L1 — local/sandbox write, automatic
 * L2 — branch/preview write, automatic if branch-safe
 * L3 — controlled external mutation, pre-approved policy required
 * L4 — production mutation, explicit approval required
 * L5 — irreversible/high-consequence, approval + rollback plan required
 * 
 * APEX may automate: L0, L1, L2
 * APEX must get approval for: L3, L4, L5
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type IssueSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type IssueStatus = 'open' | 'in_progress' | 'patched' | 'approved' | 'blocked';
export type CollectorSource = 'github' | 'vercel' | 'supabase' | 'autobuilder_bridge' | 'memory';

export interface SentinelEvidence {
  source: CollectorSource;
  collectedAt: string;
  data: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export interface SentinelDomainScore {
  domain: string;
  score: number; // 0-100
  maxScore: number;
  issues: SentinelFinding[];
  evidenceRefs: string[];
}

export interface SentinelFinding {
  id: string;
  domain: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  riskLevel: RiskLevel;
  autoFixEligible: boolean;
  status: IssueStatus;
  remediationPlan?: string;
  branchSafePatch?: string;
  validationCommand?: string;
  rollbackPlan?: string;
}

export interface SentinelScoreRun {
  runId: string;
  timestamp: string;
  totalScore: number;
  maxScore: number;
  domains: SentinelDomainScore[];
  findings: SentinelFinding[];
  evidenceRefs: string[];
  approvalRequired: SentinelFinding[];
  autoFixQueue: SentinelFinding[];
}

export interface SentinelReceipt {
  receiptId: string;
  runId: string;
  action: string;
  timestamp: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  result: 'success' | 'dry_run' | 'blocked' | 'pending_approval';
  evidence: string;
  rollbackPlan?: string;
  mutatedProduction: false; // ALWAYS false — enforced by type
}

// ─── Risk Gate Enforcer ───────────────────────────────────────────────────────

export function enforceRiskGate(
  level: RiskLevel,
  action: string,
  approvalToken?: string
): { allowed: boolean; reason: string } {
  if (level === 'L0') return { allowed: true, reason: 'Read-only, automatically approved' };
  if (level === 'L1') return { allowed: true, reason: 'Sandbox write, automatically approved' };
  if (level === 'L2') return { allowed: true, reason: 'Branch-safe write, automatically approved' };
  if (level === 'L3') {
    return approvalToken === process.env.SENTINEL_APPROVAL_TOKEN
      ? { allowed: true, reason: 'Pre-approved policy token verified' }
      : { allowed: false, reason: 'L3: Controlled external mutation — policy approval required' };
  }
  if (level === 'L4') {
    return { allowed: false, reason: 'L4: Production mutation — explicit human approval required. Submit approval request.' };
  }
  if (level === 'L5') {
    return { allowed: false, reason: 'L5: Irreversible action — explicit approval + rollback plan required. Escalate to Jeremy.' };
  }
  return { allowed: false, reason: 'Unknown risk level — blocked by default' };
}

// ─── Receipt Writer ───────────────────────────────────────────────────────────

export function writeSentinelReceipt(
  runId: string,
  action: string,
  riskLevel: RiskLevel,
  result: SentinelReceipt['result'],
  evidence: string,
  rollbackPlan?: string
): SentinelReceipt {
  return {
    receiptId: `sentinel_receipt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    runId,
    action,
    timestamp: new Date().toISOString(),
    riskLevel,
    approvalRequired: ['L3','L4','L5'].includes(riskLevel),
    result,
    evidence,
    rollbackPlan,
    mutatedProduction: false,
  };
}

// ─── Score Engine ─────────────────────────────────────────────────────────────

export function scoreDomain(
  domain: string,
  checks: Array<{ name: string; weight: number; pass: boolean; finding?: Omit<SentinelFinding,'id'> }>
): SentinelDomainScore {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const issues: SentinelFinding[] = checks
    .filter(c => !c.pass && c.finding)
    .map((c, i) => ({ id: `${domain}_${i}_${Date.now()}`, ...c.finding! }));

  return {
    domain,
    score: Math.round((earned / total) * 100),
    maxScore: 100,
    issues,
    evidenceRefs: [`${domain}_evidence_${Date.now()}`],
  };
}
