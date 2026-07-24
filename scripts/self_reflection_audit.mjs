#!/usr/bin/env node
/**
 * Self-Reflection Deep Forensic Audit
 * Runs a comprehensive, deterministic static-analysis + structural sweep of the
 * AUTO_BUILDER-V1 codebase and emits a single structured JSON findings report.
 *
 * This is NOT an LLM "read every line" pass (too slow/expensive to run every
 * cycle) — it's the FAANG-standard automated layer: build, types, lint,
 * dependency/security audit, dead-code detection, secret-leak scan, TODO/FIXME
 * sweep, route-auth coverage, and taxonomy/structure compliance. The output
 * feeds the agent's own review + fix loop (self-heal).
 *
 * Usage: node scripts/self_reflection_audit.mjs > audit_report.json
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const findings = [];
let idCounter = 1;
const now = new Date().toISOString();

function addFinding(category, severity, location, description, suggested_fix) {
  findings.push({
    id: `sr-${now.slice(0,10)}-${String(idCounter++).padStart(3,'0')}`,
    category, severity, location, description, suggested_fix,
    detected_at: now,
    status: 'open'
  });
}

function run(cmd, opts = {}) {
  try {
    return { ok: true, out: execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], ...opts }) };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || ''), code: e.status };
  }
}

// 1. BUILD INTEGRITY
const build = run('npm run build 2>&1', { timeout: 600000, maxBuffer: 50 * 1024 * 1024 });
if (!build.ok) {
  addFinding('build_integrity', 'critical', 'root build', 'Production build fails', 'Read full untruncated build output, fix the first real compile error, rebuild');
}

// 2. TYPE INTEGRITY
const tsc = run('npx tsc --noEmit 2>&1', { timeout: 300000, maxBuffer: 50*1024*1024 });
if (!tsc.ok) {
  const errCount = (tsc.out.match(/error TS/g) || []).length;
  addFinding('type_integrity', errCount > 20 ? 'high' : 'medium', 'tsconfig scope', `${errCount} TypeScript type errors`, 'Triage by file, fix highest-traffic routes first');
}

// 3. LINT
const lint = run('npm run lint -- --format json 2>&1', { timeout: 300000, maxBuffer: 50*1024*1024 });
try {
  const jsonStart = lint.out.indexOf('[');
  const lintResults = JSON.parse(lint.out.slice(jsonStart));
  let errCount = 0, warnCount = 0;
  for (const file of lintResults) {
    errCount += file.errorCount;
    warnCount += file.warningCount;
    for (const msg of file.messages) {
      if (msg.severity === 2) {
        addFinding('lint_error', 'medium', `${path.relative(ROOT, file.filePath)}:${msg.line}`, `${msg.ruleId}: ${msg.message}`, 'Fix per ESLint rule guidance or add justified inline suppression');
      }
    }
  }
} catch (e) {
  // lint output not parseable as JSON - non-fatal, note it
  addFinding('tooling_gap', 'low', 'scripts/self_reflection_audit.mjs', 'Lint output could not be parsed as JSON this run', 'Verify eslint --format json flag support in current config');
}

// 4. DEPENDENCY / SECURITY AUDIT
const audit = run('npm audit --json 2>&1', { timeout: 120000, maxBuffer: 20*1024*1024 });
try {
  const parsed = JSON.parse(audit.out);
  const vulns = parsed.metadata?.vulnerabilities || {};
  for (const [level, count] of Object.entries(vulns)) {
    if (count > 0 && ['high','critical'].includes(level)) {
      addFinding('dependency_security', level === 'critical' ? 'critical' : 'high', 'package.json / node_modules', `${count} ${level}-severity dependency vulnerabilities`, 'Run npm audit fix, or manually bump affected packages; re-audit after');
    }
  }
} catch(e) { /* audit json parse best-effort */ }

// 5. SECRET-LEAK SCAN (regex-based, common patterns)
const secretPatterns = [
  { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Generic API Key assignment', re: /(api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-\.]{20,}['"]/i },
  { name: 'Private Key block', re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
];
const grepResult = run(`grep -rInE "AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY-----" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage .`);
if (grepResult.ok && grepResult.out.trim()) {
  const lines = grepResult.out.trim().split('\n').slice(0, 20);
  for (const l of lines) {
    addFinding('secret_leak', 'critical', l.split(':').slice(0,2).join(':'), 'Possible hardcoded credential/key pattern matched in source', 'Move to environment variable / secret manager immediately, rotate the exposed credential');
  }
}

// 6. TODO/FIXME/HACK SWEEP
const todoResult = run(`grep -rInE "TODO|FIXME|HACK|XXX" --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage . | head -100`);
if (todoResult.ok && todoResult.out.trim()) {
  const lines = todoResult.out.trim().split('\n');
  addFinding('tech_debt', 'low', `${lines.length} locations`, `${lines.length} TODO/FIXME/HACK markers found in source (see audit log for full list)`, 'Triage each: resolve, ticket, or remove if stale');
}

// 7. EMPTY CATCH BLOCK SWEEP (error-swallowing)
const emptyCatch = run(`grep -rInE "catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}" --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage .`);
if (emptyCatch.ok && emptyCatch.out.trim()) {
  const lines = emptyCatch.out.trim().split('\n');
  for (const l of lines) {
    addFinding('error_handling', 'medium', l.split(':').slice(0,2).join(':'), 'Empty catch block silently swallows errors', 'Log the error (structured logger) or document why silence is intentional');
  }
}

// 8. API ROUTE AUTH COVERAGE (cron/webhook routes should check auth)
const cronRoutes = run(`find app/api/cron app/api/webhooks -name 'route.ts' 2>/dev/null`);
if (cronRoutes.ok) {
  const files = cronRoutes.out.trim().split('\n').filter(Boolean);
  for (const f of files) {
    const content = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
    if (!/CRON_SECRET|authorization|verifySignature|x-hub-signature/i.test(content)) {
      addFinding('security_hardening', 'high', f, 'Cron/webhook route has no visible auth/signature check', 'Add CRON_SECRET bearer check (cron) or signature verification (webhook)');
    }
  }
}

// 9. DUPLICATE / REDUNDANT FILE NAME DETECTION (rough heuristic)
const allFiles = run(`find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | grep -v '.git' | grep -v '.next'`);
if (allFiles.ok) {
  const names = {};
  for (const f of allFiles.out.trim().split('\n').filter(Boolean)) {
    const base = path.basename(f);
    names[base] = (names[base] || []).concat(f);
  }
  for (const [base, files] of Object.entries(names)) {
    if (files.length > 1 && !['index.ts','index.tsx','route.ts','page.tsx','layout.tsx'].includes(base)) {
      addFinding('redundancy', 'low', files.join(', '), `Duplicate filename '${base}' appears ${files.length} times - possible copy-paste redundancy`, 'Review for consolidation opportunity');
    }
  }
}

// 10. EXISTING VALIDATE SCRIPTS (project-defined checks)
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
for (const script of Object.keys(pkg.scripts || {})) {
  if (script.startsWith('validate:')) {
    const r = run(`npm run ${script} 2>&1`, { timeout: 120000 });
    if (!r.ok) {
      addFinding('validation_failure', 'medium', `npm run ${script}`, `Project validator '${script}' failed`, 'Inspect script output, fix underlying issue, re-run validator');
    }
  }
}

const report = {
  audit_type: 'self_reflection_deep_forensic',
  run_at: now,
  repo: 'Strategic-Minds/AUTO_BUILDER-V1',
  total_findings: findings.length,
  by_severity: findings.reduce((acc,f)=>{acc[f.severity]=(acc[f.severity]||0)+1;return acc;},{}),
  by_category: findings.reduce((acc,f)=>{acc[f.category]=(acc[f.category]||0)+1;return acc;},{}),
  findings
};

console.log(JSON.stringify(report, null, 2));
