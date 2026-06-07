import { spawnSync } from 'node:child_process';

const audit = spawnSync('npm', ['audit', '--json'], {
  encoding: 'utf8',
  shell: false
});

const raw = audit.stdout || '{}';
let report;
try {
  report = JSON.parse(raw);
} catch (error) {
  console.error('Dependency audit JSON parse failed.');
  console.error(error.message);
  process.exit(1);
}

const metadata = report.metadata ?? {};
const vulnerabilities = metadata.vulnerabilities ?? {};
const advisories = Object.entries(report.vulnerabilities ?? {})
  .map(([name, item]) => ({
    name,
    severity: item.severity ?? 'unknown',
    direct: Boolean(item.isDirect),
    via: Array.isArray(item.via) ? item.via.length : 0,
    range: item.range ?? 'unknown',
    fixAvailable: item.fixAvailable ?? false
  }))
  .sort((a, b) => {
    const order = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };
    return (order[b.severity] ?? 0) - (order[a.severity] ?? 0) || a.name.localeCompare(b.name);
  });

console.log('# Dependency Audit Receipt');
console.log('');
console.log(`total=${vulnerabilities.total ?? 0}`);
console.log(`critical=${vulnerabilities.critical ?? 0}`);
console.log(`high=${vulnerabilities.high ?? 0}`);
console.log(`moderate=${vulnerabilities.moderate ?? 0}`);
console.log(`low=${vulnerabilities.low ?? 0}`);
console.log('');
console.log('## Advisories');
for (const advisory of advisories) {
  const fix = typeof advisory.fixAvailable === 'object'
    ? `available:${advisory.fixAvailable.name ?? 'unknown'}@${advisory.fixAvailable.version ?? 'unknown'}`
    : String(advisory.fixAvailable);
  console.log(`- ${advisory.severity}: ${advisory.name}; direct=${advisory.direct}; via=${advisory.via}; range=${advisory.range}; fix=${fix}`);
}

if ((vulnerabilities.high ?? 0) > 0 || (vulnerabilities.critical ?? 0) > 0) {
  console.error('Dependency audit release gate failed: high or critical vulnerabilities remain.');
  process.exit(2);
}

console.log('Dependency audit release gate passed: no high or critical vulnerabilities reported.');
