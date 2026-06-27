import { NextResponse } from 'next/server';
import { postSupabase, requireApexCron, sendWhatsApp } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITES = [
  { name: 'PEP', url: 'https://phoenix-epoxy-pros-site.vercel.app' },
  { name: 'XPS', url: 'https://xpswebsites.vercel.app' },
  { name: 'NEP', url: 'https://national-epoxy-pros-strategic-minds-advisory.vercel.app' },
  { name: 'AUTO_BUILDER', url: 'https://auto-builder-strategic-minds-advisory.vercel.app/api/health' },
  { name: 'SM_QA', url: 'https://sm-qa-agent.vercel.app' },
];

export async function GET(request: Request) {
  const blocked = requireApexCron(request, 'apex-qa-heal');
  if (blocked) return blocked;

  const results = await Promise.all(
    SITES.map(async (site) => {
      try {
        const response = await fetch(site.url, { signal: AbortSignal.timeout(8000) });
        return {
          name: site.name,
          status: response.status,
          ok: response.status === 200,
          score: response.status === 200 ? 90 : 40,
        };
      } catch {
        return { name: site.name, status: 0, ok: false, score: 0 };
      }
    }),
  );

  const failed = results.filter((result) => !result.ok);
  const avg = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
  const alert = failed.length > 0
    ? await sendWhatsApp(`APEX QA ALERT - ${failed.map((site) => `${site.name} DOWN`).join(', ')} - Avg: ${avg}/100`)
    : { ok: true, status: 0, skipped: 'no_failures' };

  const memoryWrite = await postSupabase('agent_memory', {
    agent_id: 'VALIDATOR',
    memory_type: 'qa_cycle',
    key: `qa_${Date.now()}`,
    value: { results, avg, failed: failed.length, src: 'vercel_cron' },
    importance: failed.length > 0 ? 9 : 4,
    tags: ['qa', 'vercel_cron'],
  });

  return NextResponse.json({
    ok: memoryWrite.ok && (failed.length === 0 || alert.ok),
    avg,
    sites: results,
    failed: failed.length,
    alert,
    memoryWrite,
    source: 'vercel_cron',
  });
}
