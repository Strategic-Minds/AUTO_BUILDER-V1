import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const findings = [];

function log(msg) {
  console.log(msg);
}

function runCommand(cmd, label, fatal = false) {
  try {
    log(`\n[AUDIT] ${label}...`);
    const output = execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' });
    if (output.includes('error') || output.includes('Error')) {
      findings.push({ severity: 'medium', category: label, detail: output.slice(0, 200) });
      log(`  ⚠ Issues found in ${label}`);
    } else {
      log(`  ✓ ${label} passed`);
    }
    return output;
  } catch (e) {
    if (fatal) {
      findings.push({ severity: 'high', category: label, detail: e.message.slice(0, 200) });
      log(`  ✗ FATAL: ${label} failed`);
      throw e;
    }
    findings.push({ severity: 'medium', category: label, detail: e.message.slice(0, 200) });
    log(`  ⚠ ${label} returned errors`);
    return '';
  }
}

// 1. Build check
try {
  runCommand('npm run build 2>&1', 'Build', true);
} catch (e) {
  findings.push({ severity: 'critical', category: 'Build', detail: 'Build failed' });
  log('\n❌ Build failed — stopping audit');
  process.exit(1);
}

// 2. Type check
runCommand('npx tsc --noEmit 2>&1 | head -20', 'TypeScript Check');

// 3. Linting
const lintOut = runCommand('npm run lint 2>&1 | head -30', 'ESLint');

// 4. Dependency audit
const depOut = runCommand('npm audit 2>&1 | grep -A5 "vulnerabilities\|packages audit\|found"', 'Dependency Audit');
if (depOut.includes('vulnerabilities')) {
  findings.push({ severity: 'high', category: 'Dependencies', detail: 'Vulnerabilities found' });
}

// 5. Secret pattern scan
const secretPatterns = [
  'PRIVATE_KEY',
  'SECRET_',
  'password:',
  'api_key:',
  'token:',
];
let secretHits = 0;
for (const pattern of secretPatterns) {
  try {
    const count = execSync(`grep -r "${pattern}" --include="*.ts" --include="*.js" --include="*.env*" . 2>/dev/null | grep -v node_modules | wc -l`, {
      cwd,
      encoding: 'utf-8',
    }).trim();
    if (parseInt(count) > 0) {
      secretHits++;
    }
  } catch (e) {
    // grep returned no matches
  }
}
if (secretHits > 0) {
  findings.push({ severity: 'high', category: 'Secret Scan', detail: `${secretHits} potential secret patterns found` });
  log(`  ⚠ Secret scan: ${secretHits} patterns flagged (verify not false positives)`);
} else {
  log('  ✓ Secret scan: no obvious patterns found');
}

// 6. TODO/FIXME sweep
let todoCount = 0;
try {
  const output = execSync(`grep -r "TODO\\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | wc -l`, {
    cwd,
    encoding: 'utf-8',
  }).trim();
  todoCount = parseInt(output);
  if (todoCount > 10) {
    findings.push({ severity: 'low', category: 'TODOs', detail: `${todoCount} TODO/FIXME comments` });
    log(`  ℹ TODO/FIXME count: ${todoCount} (informational)`);
  }
} catch (e) {
  // likely no matches
}

// 7. Empty catch sweep
let emptyCatches = 0;
try {
  const output = execSync(`grep -r "catch.*{\\s*}" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | wc -l`, {
    cwd,
    encoding: 'utf-8',
  }).trim();
  emptyCatches = parseInt(output);
  if (emptyCatches > 0) {
    findings.push({ severity: 'medium', category: 'Error Handling', detail: `${emptyCatches} empty catch blocks` });
    log(`  ⚠ Empty catch blocks: ${emptyCatches}`);
  }
} catch (e) {
  // likely no matches
}

// 8. Cron/webhook auth coverage check (quick scan)
let cronAuthGaps = 0;
try {
  const cronFiles = execSync(`find . -path ./node_modules -prune -o -name "*cron*" -o -name "*webhook*" 2>/dev/null | head -20`, {
    cwd,
    encoding: 'utf-8',
  }).split('\n').filter(f => f && !f.includes('node_modules'));
  
  for (const file of cronFiles.slice(0, 5)) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), 'utf-8');
      if (!content.includes('auth') && (file.includes('cron') || file.includes('webhook'))) {
        cronAuthGaps++;
      }
    } catch (e) {
      // unreadable
    }
  }
  if (cronAuthGaps > 0) {
    findings.push({ severity: 'high', category: 'Auth Coverage', detail: `${cronAuthGaps} cron/webhook routes may lack auth checks` });
    log(`  ⚠ Cron/webhook auth gap: ${cronAuthGaps} files flagged`);
  }
} catch (e) {
  // scan failed, skip
}

// 9. Filename redundancy scan
const fileMap = {};
try {
  const allFiles = execSync(`find . -path ./node_modules -prune -o -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -100`, {
    cwd,
    encoding: 'utf-8',
  }).split('\n').filter(f => f);
  
  for (const file of allFiles) {
    const name = path.basename(file);
    if (!fileMap[name]) fileMap[name] = [];
    fileMap[name].push(file);
  }
  
  let dupeCount = 0;
  for (const [name, paths] of Object.entries(fileMap)) {
    if (paths.length > 1 && (name.includes('index') || name.includes('types'))) {
      dupeCount++;
      findings.push({ severity: 'low', category: 'Filename Redundancy', detail: `${name} appears ${paths.length}x` });
    }
  }
  if (dupeCount > 0) {
    log(`  ℹ Duplicate filenames: ${dupeCount} (informational)`);
  }
} catch (e) {
  // scan failed
}

// 10. Run validate:* scripts if they exist
try {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
  const validateScripts = Object.keys(pkgJson.scripts || {}).filter(s => s.startsWith('validate:'));
  
  for (const script of validateScripts) {
    try {
      runCommand(`npm run ${script} 2>&1 | head -10`, `validate:${script.split(':')[1]}`);
    } catch (e) {
      // ignore
    }
  }
} catch (e) {
  // no package.json or parse error
}

// Final summary
log('\n' + '='.repeat(60));
log(`AUDIT COMPLETE: ${findings.length} findings`);
log('='.repeat(60));

const summary = {
  timestamp: new Date().toISOString(),
  total_findings: findings.length,
  by_severity: {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  },
  findings: findings,
};

console.log('\nJSON Summary:');
console.log(JSON.stringify(summary, null, 2));

process.exit(summary.by_severity.critical > 0 ? 1 : 0);
