/**
 * SENTINEL LIVE READ-ONLY EVIDENCE COLLECTORS
 * 
 * Each collector is L0 (read-only) — fully automatic, no approval needed.
 * All collectors implement the SentinelEvidenceSource contract.
 * 
 * PRODUCTION MUTATION: NEVER — enforced by read-only HTTP methods only.
 */

import type { SentinelEvidence, CollectorSource } from './lib';

type CollectorResult = Omit<SentinelEvidence, 'collectedAt'>;

// ─── GitHub Collector ─────────────────────────────────────────────────────────

export async function collectGitHubEvidence(): Promise<SentinelEvidence> {
  const ts = new Date().toISOString();
  try {
    const GH_TOKEN = process.env.GITHUB_TOKEN ?? '';
    const headers = { Authorization: `token ${GH_TOKEN}`, Accept: 'application/vnd.github+json' };
    const base = 'https://api.github.com/repos/Strategic-Minds/AUTO_BUILDER';

    const [repoRes, branchRes, prsRes, workflowsRes] = await Promise.all([
      fetch(base, { headers }),
      fetch(`${base}/branches`, { headers }),
      fetch(`${base}/pulls?state=open`, { headers }),
      fetch(`${base}/actions/workflows`, { headers }),
    ]);

    const [repo, branches, prs, workflows] = await Promise.all([
      repoRes.json(), branchRes.json(), prsRes.json(), workflowsRes.json()
    ]);

    // Check key files
    const keyFiles = [
      'src/app/api/mcp/route.ts',
      'src/app/api/sentinel/route.ts',
      'src/app/api/health/route.ts',
      'vercel.json',
      'package.json',
      '.env.example',
    ];
    const fileChecks: Record<string, boolean> = {};
    await Promise.all(keyFiles.map(async (f) => {
      const r = await fetch(`${base}/contents/${f}`, { headers });
      fileChecks[f] = r.status === 200;
    }));

    // Branch protection on main
    const bpRes = await fetch(`${base}/branches/main/protection`, { headers });
    const branchProtection = bpRes.status === 200;

    return {
      source: 'github',
      collectedAt: ts,
      success: true,
      data: {
        repoName: repo.name,
        defaultBranch: repo.default_branch,
        lastPush: repo.pushed_at,
        openPRs: prs.length,
        branchCount: Array.isArray(branches) ? branches.length : 0,
        workflowCount: workflows.total_count ?? 0,
        filePresence: fileChecks,
        branchProtectionEnabled: branchProtection,
        sentinelRouteExists: fileChecks['src/app/api/sentinel/route.ts'] ?? false,
        healthRouteExists: fileChecks['src/app/api/health/route.ts'] ?? false,
        mcpRouteExists: fileChecks['src/app/api/mcp/route.ts'] ?? false,
      }
    };
  } catch (error) {
    return { source: 'github', collectedAt: ts, success: false, error: String(error), data: {} };
  }
}

// ─── Vercel Collector ─────────────────────────────────────────────────────────

export async function collectVercelEvidence(): Promise<SentinelEvidence> {
  const ts = new Date().toISOString();
  try {
    const VCL = process.env.VERCEL_TOKEN ?? '';
    const headers = { Authorization: `Bearer ${VCL}` };
    const BASE_URL = 'https://auto-builder-strategic-minds-advisory.vercel.app';

    const [projRes, depsRes] = await Promise.all([
      fetch('https://api.vercel.com/v9/projects/auto-builder-strategic-minds-advisory', { headers }),
      fetch('https://api.vercel.com/v6/deployments?projectId=prj_auto_builder&limit=5', { headers }),
    ]);

    const proj = await projRes.json();
    const deps = await depsRes.json();

    // Route smoke tests (L0 — read only GET)
    const smokeRoutes = ['/api/health', '/api/mcp', '/api/sentinel/score'];
    const smokeResults: Record<string, number> = {};
    await Promise.all(smokeRoutes.map(async (route) => {
      try {
        const r = await fetch(`${BASE_URL}${route}`, { signal: AbortSignal.timeout(8000) });
        smokeResults[route] = r.status;
      } catch {
        smokeResults[route] = 0;
      }
    }));

    return {
      source: 'vercel',
      collectedAt: ts,
      success: true,
      data: {
        projectName: proj.name,
        framework: proj.framework,
        nodeVersion: proj.nodeVersion,
        latestDeployments: deps.deployments?.slice(0,3).map((d: Record<string,unknown>) => ({
          id: d.uid, state: d.readyState, url: d.url, created: d.createdAt
        })) ?? [],
        routeSmokeResults: smokeResults,
        cronCount: Array.isArray(proj.crons) ? proj.crons.length : 0,
        healthRouteOk: smokeResults['/api/health'] === 200,
        mcpRouteOk: smokeResults['/api/mcp'] !== 0,
        sentinelRouteOk: smokeResults['/api/sentinel/score'] === 200,
      }
    };
  } catch (error) {
    return { source: 'vercel', collectedAt: ts, success: false, error: String(error), data: {} };
  }
}

// ─── Supabase Collector ───────────────────────────────────────────────────────

export async function collectSupabaseEvidence(): Promise<SentinelEvidence> {
  const ts = new Date().toISOString();
  try {
    const SB_URL = process.env.SUPABASE_URL ?? 'https://prhppuuwcnmfdhwsagug.supabase.co';
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY ?? '';
    const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

    // Read-only table checks (no mutations)
    const tables = ['agent_memory', 'bridge_tasks', 'bridge_receipts', 'agent_registry', 'task_queue', 'approval_gate'];
    const tableCounts: Record<string, number | string> = {};

    await Promise.all(tables.map(async (t) => {
      try {
        const r = await fetch(`${SB_URL}/rest/v1/${t}?select=count`, {
          headers: { ...headers, Prefer: 'count=exact', Range: '0-0' }
        });
        const count = r.headers.get('content-range')?.split('/')[1] ?? 'unknown';
        tableCounts[t] = count;
      } catch {
        tableCounts[t] = 'unreachable';
      }
    }));

    // Check for pending approvals
    const approvalRes = await fetch(
      `${SB_URL}/rest/v1/approval_gate?status=eq.pending&select=id,action,risk_level,created_at&limit=10`,
      { headers }
    );
    const pendingApprovals = approvalRes.ok ? await approvalRes.json() : [];

    // Check for recent bridge_receipts (last 10)
    const receiptRes = await fetch(
      `${SB_URL}/rest/v1/bridge_receipts?select=id,status,created_at&order=created_at.desc&limit=10`,
      { headers }
    );
    const recentReceipts = receiptRes.ok ? await receiptRes.json() : [];

    return {
      source: 'supabase',
      collectedAt: ts,
      success: true,
      data: {
        tableCounts,
        pendingApprovals: pendingApprovals.length,
        pendingApprovalDetails: pendingApprovals.slice(0, 5),
        recentReceiptCount: recentReceipts.length,
        agentMemoryReachable: tableCounts['agent_memory'] !== 'unreachable',
        bridgeTasksReachable: tableCounts['bridge_tasks'] !== 'unreachable',
        approvalGateReachable: tableCounts['approval_gate'] !== 'unreachable',
      }
    };
  } catch (error) {
    return { source: 'supabase', collectedAt: ts, success: false, error: String(error), data: {} };
  }
}

// ─── AUTO_BUILDER Bridge Collector ───────────────────────────────────────────

export async function collectAutoBuilderEvidence(): Promise<SentinelEvidence> {
  const ts = new Date().toISOString();
  const BASE = 'https://auto-builder-strategic-minds-advisory.vercel.app';
  try {
    const healthRes = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(10000) });
    const health = healthRes.ok ? await healthRes.json() : {};

    // MCP manifest (L0)
    const manifestRes = await fetch(`${BASE}/api/mcp/manifest`, {
      signal: AbortSignal.timeout(8000)
    });
    const manifest = manifestRes.ok ? await manifestRes.json() : {};

    return {
      source: 'autobuilder_bridge',
      collectedAt: ts,
      success: true,
      data: {
        healthStatus: health.status ?? 'unknown',
        systemName: health.system ?? 'unknown',
        appVersion: health.app?.version ?? 'unknown',
        commitSha: health.deployment?.commitSha ?? 'unknown',
        environment: health.deployment?.environment ?? 'unknown',
        manifestToolCount: manifest.tools?.length ?? 0,
        healthOk: healthRes.status === 200,
        mcpManifestOk: manifestRes.status === 200,
        bridgeReadiness: health.readiness ?? 'unknown',
      }
    };
  } catch (error) {
    return { source: 'autobuilder_bridge', collectedAt: ts, success: false, error: String(error), data: {} };
  }
}

// ─── Memory/Drive Collector ───────────────────────────────────────────────────

export async function collectMemoryEvidence(): Promise<SentinelEvidence> {
  const ts = new Date().toISOString();
  try {
    const SB_URL = process.env.SUPABASE_URL ?? 'https://prhppuuwcnmfdhwsagug.supabase.co';
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY ?? '';
    const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

    // Latest high-importance memories
    const memRes = await fetch(
      `${SB_URL}/rest/v1/agent_memory?importance=gte.8&order=created_at.desc&limit=10&select=key,importance,tags`,
      { headers }
    );
    const memories = memRes.ok ? await memRes.json() : [];

    // Architecture doc presence (check key memory keys)
    const keyMemoryKeys = [
      'AUTO_BUILDER_MCP_v2_HANDOFF',
      'MANDATORY_MEMORY_ANALYSIS_SOP',
      'STRATEGIC_COUNCIL_WORKSPACE',
    ];
    const keyPresence: Record<string, boolean> = {};
    for (const key of keyMemoryKeys) {
      const r = await fetch(
        `${SB_URL}/rest/v1/agent_memory?key=eq.${encodeURIComponent(key)}&limit=1`,
        { headers }
      );
      const rows = r.ok ? await r.json() : [];
      keyPresence[key] = rows.length > 0;
    }

    return {
      source: 'memory',
      collectedAt: ts,
      success: true,
      data: {
        highImportanceMemoryCount: memories.length,
        keyMemoryPresence: keyPresence,
        architectureDocPresent: keyPresence['AUTO_BUILDER_MCP_v2_HANDOFF'] ?? false,
        sopPresent: keyPresence['MANDATORY_MEMORY_ANALYSIS_SOP'] ?? false,
      }
    };
  } catch (error) {
    return { source: 'memory', collectedAt: ts, success: false, error: String(error), data: {} };
  }
}

// ─── Master Collector ─────────────────────────────────────────────────────────

export async function collectAllEvidence(): Promise<SentinelEvidence[]> {
  const results = await Promise.allSettled([
    collectGitHubEvidence(),
    collectVercelEvidence(),
    collectSupabaseEvidence(),
    collectAutoBuilderEvidence(),
    collectMemoryEvidence(),
  ]);

  return results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          source: 'memory' as CollectorSource,
          collectedAt: new Date().toISOString(),
          success: false,
          error: String((r as PromiseRejectedResult).reason),
          data: {},
        }
  );
}
