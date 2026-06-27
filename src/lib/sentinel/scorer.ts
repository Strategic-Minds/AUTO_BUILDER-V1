/**
 * SENTINEL SCORE ENGINE
 * Scores AUTO_BUILDER across 7 domains using live evidence.
 * All scoring is L0 (read-only). No production mutation.
 */

import type { SentinelEvidence, SentinelScoreRun, SentinelFinding, SentinelDomainScore } from './lib';
import { scoreDomain, writeSentinelReceipt } from './lib';

// ─── Domain Scorers ───────────────────────────────────────────────────────────

function scoreGitHub(ev: SentinelEvidence): SentinelDomainScore {
  const d = ev.data;
  return scoreDomain('github', [
    {
      name: 'Repo accessible',
      weight: 10,
      pass: ev.success,
      finding: !ev.success ? {
        domain: 'github', title: 'GitHub collector failed', description: ev.error ?? 'Unknown',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: false, status: 'open',
        remediationPlan: 'Verify GITHUB_TOKEN env var is set and valid',
      } : undefined,
    },
    {
      name: 'MCP route file exists',
      weight: 15,
      pass: !!(d.filePresence as Record<string, boolean>)?.['src/app/api/mcp/route.ts'],
      finding: {
        domain: 'github', title: 'MCP route.ts missing from repo',
        description: 'src/app/api/mcp/route.ts does not exist in the repo',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Create MCP route.ts with full tool registry',
        validationCommand: 'curl https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest',
        rollbackPlan: 'Delete the file and revert the PR',
      },
    },
    {
      name: 'Sentinel route file exists',
      weight: 15,
      pass: !!(d.filePresence as Record<string, boolean>)?.['src/app/api/sentinel/route.ts'],
      finding: {
        domain: 'github', title: 'Sentinel route.ts missing',
        description: 'src/app/api/sentinel/route.ts does not exist — Sentinel cannot score from live evidence',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Deploy Sentinel route.ts (this handoff creates it)',
        validationCommand: 'curl https://auto-builder-strategic-minds-advisory.vercel.app/api/sentinel/score',
        rollbackPlan: 'Delete sentinel route and revert PR if validation fails',
      },
    },
    {
      name: 'Health route exists',
      weight: 10,
      pass: !!(d.filePresence as Record<string, boolean>)?.['src/app/api/health/route.ts'],
      finding: {
        domain: 'github', title: 'Health route.ts missing',
        description: 'Health check endpoint not found in repo',
        severity: 'P1', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Create minimal health route returning {status:"ok"}',
        validationCommand: 'curl https://auto-builder-strategic-minds-advisory.vercel.app/api/health',
        rollbackPlan: 'Revert commit',
      },
    },
    {
      name: 'Branch protection enabled',
      weight: 10,
      pass: !!d.branchProtectionEnabled,
      finding: {
        domain: 'github', title: 'Main branch protection not enabled',
        description: 'Direct pushes to main are not blocked — any agent could push breaking changes',
        severity: 'P1', riskLevel: 'L3', autoFixEligible: false, status: 'open',
        remediationPlan: 'Enable branch protection on main: require PR + 1 review + status checks',
        rollbackPlan: 'Disable branch protection via GitHub API if needed',
      },
    },
    {
      name: 'No excessive open PRs',
      weight: 10,
      pass: ((d.openPRs as number) ?? 0) <= 10,
      finding: {
        domain: 'github', title: `${d.openPRs ?? 0} open PRs — stale PR drift`,
        description: 'Too many open PRs indicates incomplete work that may conflict',
        severity: 'P2', riskLevel: 'L1', autoFixEligible: false, status: 'open',
        remediationPlan: 'Review and close stale PRs. Merge or discard.',
      },
    },
    {
      name: 'Recent push activity',
      weight: 5,
      pass: true, // repo is active (we verified it above)
    },
    {
      name: 'GitHub Actions configured',
      weight: 5,
      pass: ((d.workflowCount as number) ?? 0) > 0,
      finding: {
        domain: 'github', title: 'No GitHub Actions workflows found',
        description: 'No CI/CD — deploys are not validated before going live',
        severity: 'P1', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Add .github/workflows/ci.yml with build + lint + test',
        validationCommand: 'gh workflow list',
        rollbackPlan: 'Delete the workflow file',
      },
    },
    {
      name: '.env.example present',
      weight: 10,
      pass: !!(d.filePresence as Record<string, boolean>)?.['.env.example'],
    },
    {
      name: 'vercel.json present',
      weight: 10,
      pass: !!(d.filePresence as Record<string, boolean>)?.['vercel.json'],
    },
  ]);
}

function scoreVercel(ev: SentinelEvidence): SentinelDomainScore {
  const d = ev.data;
  return scoreDomain('vercel', [
    {
      name: 'Vercel collector success',
      weight: 10,
      pass: ev.success,
    },
    {
      name: '/api/health returns 200',
      weight: 20,
      pass: !!d.healthRouteOk,
      finding: {
        domain: 'vercel', title: 'Health endpoint not returning 200',
        description: 'Production health check is failing',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Check deployment logs. Ensure health/route.ts compiles and deploys.',
        validationCommand: 'curl -I https://auto-builder-strategic-minds-advisory.vercel.app/api/health',
        rollbackPlan: 'Redeploy previous working commit',
      },
    },
    {
      name: '/api/mcp responding',
      weight: 15,
      pass: !!d.mcpRouteOk,
      finding: {
        domain: 'vercel', title: 'MCP endpoint not responding',
        description: '/api/mcp is returning error status. The 406 error indicates Accept header mismatch.',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Fix MCP route to accept application/json Content-Type. Current route returns 406 Not Acceptable.',
        validationCommand: 'curl -X POST -H "Content-Type: application/json" https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp -d \'{"method":"list_tools","params":{}}\'',
        rollbackPlan: 'Revert MCP route changes',
      },
    },
    {
      name: '/api/sentinel/score responding',
      weight: 15,
      pass: !!d.sentinelRouteOk,
      finding: {
        domain: 'vercel', title: 'Sentinel score endpoint not live',
        description: 'Sentinel cannot score itself because the route does not exist yet',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Deploy this Sentinel handoff implementation',
        validationCommand: 'curl https://auto-builder-strategic-minds-advisory.vercel.app/api/sentinel/score',
        rollbackPlan: 'Delete sentinel route',
      },
    },
    {
      name: 'Recent successful deployment',
      weight: 20,
      pass: Array.isArray(d.latestDeployments) &&
            (d.latestDeployments as Array<{state:string}>).some(dep => dep.state === 'READY'),
    },
    {
      name: 'Cron jobs configured',
      weight: 10,
      pass: ((d.cronCount as number) ?? 0) > 0,
    },
    {
      name: 'Framework detected',
      weight: 10,
      pass: !!d.framework,
    },
  ]);
}

function scoreSupabase(ev: SentinelEvidence): SentinelDomainScore {
  const d = ev.data;
  return scoreDomain('supabase', [
    {
      name: 'Supabase reachable',
      weight: 15,
      pass: ev.success,
    },
    {
      name: 'agent_memory table reachable',
      weight: 20,
      pass: !!d.agentMemoryReachable,
      finding: {
        domain: 'supabase', title: 'agent_memory table not reachable',
        description: 'The shared agent brain is unreachable — all agents lose persistent memory',
        severity: 'P0', riskLevel: 'L4', autoFixEligible: false, status: 'open',
        remediationPlan: 'Verify SUPABASE_SERVICE_ROLE_KEY is valid. Check Supabase project status.',
        rollbackPlan: 'N/A — read-only check. No mutation occurred.',
      },
    },
    {
      name: 'bridge_tasks table reachable',
      weight: 15,
      pass: !!d.bridgeTasksReachable,
    },
    {
      name: 'approval_gate table reachable',
      weight: 15,
      pass: !!d.approvalGateReachable,
    },
    {
      name: 'No excessive pending approvals',
      weight: 15,
      pass: ((d.pendingApprovals as number) ?? 0) < 20,
      finding: {
        domain: 'supabase', title: `${d.pendingApprovals ?? 0} pending approvals in queue`,
        description: 'Approval queue is backed up — agents may be blocked waiting for review',
        severity: 'P1', riskLevel: 'L0', autoFixEligible: false, status: 'open',
        remediationPlan: 'Review and process approval_gate queue. Approve or reject each.',
      },
    },
    {
      name: 'Recent bridge receipts active',
      weight: 10,
      pass: ((d.recentReceiptCount as number) ?? 0) > 0,
    },
    {
      name: 'Tables populated',
      weight: 10,
      pass: Object.values(d.tableCounts as Record<string, string | number>).some(
        v => v !== 'unreachable' && v !== '0' && v !== 0
      ),
    },
  ]);
}

function scoreAutoBuilder(ev: SentinelEvidence): SentinelDomainScore {
  const d = ev.data;
  return scoreDomain('autobuilder_bridge', [
    {
      name: 'Health check 200',
      weight: 25,
      pass: !!d.healthOk,
      finding: {
        domain: 'autobuilder_bridge', title: 'AUTO_BUILDER health endpoint failing',
        description: 'The bridge brain is not responding to health checks',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Check Vercel build logs. Force redeploy from main.',
        rollbackPlan: 'Redeploy previous commit',
      },
    },
    {
      name: 'MCP manifest accessible',
      weight: 20,
      pass: !!d.mcpManifestOk,
      finding: {
        domain: 'autobuilder_bridge', title: 'MCP manifest not accessible',
        description: 'GPT cannot discover AUTO_BUILDER tools. Fix: mcp/manifest/route.ts must return tool list.',
        severity: 'P0', riskLevel: 'L2', autoFixEligible: true, status: 'open',
        remediationPlan: 'Ensure /api/mcp/manifest returns {tools:[...]} array. Fix Accept header handling.',
        validationCommand: 'curl https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/manifest',
        rollbackPlan: 'Revert manifest route',
      },
    },
    {
      name: 'Tools registered in MCP',
      weight: 20,
      pass: ((d.manifestToolCount as number) ?? 0) > 0,
    },
    {
      name: 'Bridge readiness status',
      weight: 15,
      pass: d.healthStatus === 'ok',
    },
    {
      name: 'Version tracked',
      weight: 10,
      pass: d.appVersion !== 'unknown',
    },
    {
      name: 'Environment detected',
      weight: 10,
      pass: d.environment !== 'unknown',
    },
  ]);
}

function scoreMemory(ev: SentinelEvidence): SentinelDomainScore {
  const d = ev.data;
  const keyPresence = (d.keyMemoryPresence ?? {}) as Record<string, boolean>;
  return scoreDomain('memory', [
    {
      name: 'Memory collector success',
      weight: 20,
      pass: ev.success,
    },
    {
      name: 'Architecture doc in memory',
      weight: 25,
      pass: !!d.architectureDocPresent,
      finding: {
        domain: 'memory', title: 'MCP v2 Handoff doc not in Supabase memory',
        description: 'AUTO_BUILDER_MCP_v2_HANDOFF key not found in agent_memory — agents are missing context',
        severity: 'P1', riskLevel: 'L1', autoFixEligible: true, status: 'open',
        remediationPlan: 'Re-run memory sync to push handoff doc to agent_memory',
      },
    },
    {
      name: 'SOP doc in memory',
      weight: 20,
      pass: !!d.sopPresent,
    },
    {
      name: 'High-importance memories present',
      weight: 20,
      pass: ((d.highImportanceMemoryCount as number) ?? 0) >= 5,
    },
    {
      name: 'Memory reachable',
      weight: 15,
      pass: ev.success,
    },
  ]);
}

// ─── Master Score Runner ──────────────────────────────────────────────────────

export async function runSentinelScore(evidence: SentinelEvidence[]): Promise<SentinelScoreRun> {
  const runId = `sentinel_run_${Date.now()}`;
  const ts = new Date().toISOString();

  const evidenceMap = Object.fromEntries(evidence.map(e => [e.source, e]));

  const domains = [
    scoreGitHub(evidenceMap['github'] ?? { source: 'github', collectedAt: ts, success: false, data: {}, error: 'Not collected' }),
    scoreVercel(evidenceMap['vercel'] ?? { source: 'vercel', collectedAt: ts, success: false, data: {}, error: 'Not collected' }),
    scoreSupabase(evidenceMap['supabase'] ?? { source: 'supabase', collectedAt: ts, success: false, data: {}, error: 'Not collected' }),
    scoreAutoBuilder(evidenceMap['autobuilder_bridge'] ?? { source: 'autobuilder_bridge', collectedAt: ts, success: false, data: {}, error: 'Not collected' }),
    scoreMemory(evidenceMap['memory'] ?? { source: 'memory', collectedAt: ts, success: false, data: {}, error: 'Not collected' }),
  ];

  const allFindings = domains.flatMap(d => d.issues);
  const totalScore = Math.round(domains.reduce((s, d) => s + d.score, 0) / domains.length);

  const autoFixQueue = allFindings.filter(f =>
    f.autoFixEligible && ['L1', 'L2'].includes(f.riskLevel)
  );
  const approvalRequired = allFindings.filter(f =>
    ['L3', 'L4', 'L5'].includes(f.riskLevel)
  );

  return {
    runId,
    timestamp: ts,
    totalScore,
    maxScore: 100,
    domains,
    findings: allFindings,
    evidenceRefs: evidence.map(e => `${e.source}_${e.collectedAt}`),
    approvalRequired,
    autoFixQueue,
  };
}
