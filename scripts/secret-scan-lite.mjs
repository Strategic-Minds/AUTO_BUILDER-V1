import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const maxFileBytes = 1024 * 1024;
const ignoredDirs = new Set([
  '.git',
  '.next',
  'coverage',
  'node_modules',
  'playwright-report',
  'test-results',
]);
const ignoredFiles = new Set(['scripts/secret-scan-lite.mjs']);

const rules = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    pattern: /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^\s"'`\\]+))/g,
    isAllowed: isSafeSupabasePlaceholder,
  },
  {
    name: 'OPENAI_API_KEY',
    pattern: /\bOPENAI_API_KEY\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^\s"'`\\]+))/g,
    isAllowed: isSafeOpenAiPlaceholder,
  },
];

function toRepoPath(path) {
  return relative(root, path).split(sep).join('/');
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github' && entry.name !== '.env.example') {
      continue;
    }

    const fullPath = join(dir, entry.name);
    const repoPath = toRepoPath(fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(fullPath, files);
      }
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(repoPath)) {
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.size <= maxFileBytes) {
      files.push(fullPath);
    }
  }
  return files;
}

function cleanValue(rawValue) {
  return String(rawValue ?? '')
    .trim()
    .replace(/^['"`]|['"`]$/g, '')
    .replace(/[;,]$/, '')
    .trim();
}

function isGenericPlaceholder(rawValue) {
  const value = cleanValue(rawValue);
  const lower = value.toLowerCase();

  return (
    value.length === 0 ||
    value.includes('${') ||
    value.includes('<') ||
    value.includes('>') ||
    lower.includes('placeholder') ||
    lower.includes('redacted') ||
    lower.includes('replace') ||
    lower.includes('example') ||
    lower.startsWith('your-') ||
    lower.startsWith('test-') ||
    lower.startsWith('dummy-')
  );
}

function isSafeSupabasePlaceholder(rawValue) {
  const value = cleanValue(rawValue);
  const lower = value.toLowerCase();

  if (isGenericPlaceholder(value)) {
    return true;
  }

  if (lower === 'service-role-key' || lower.startsWith('service-role-key')) {
    return true;
  }

  if (lower === 'supabase-service-role-key:latest') {
    return true;
  }

  if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
    return false;
  }

  return !/[A-Za-z0-9_-]{32,}/.test(value);
}

function isSafeOpenAiPlaceholder(rawValue) {
  const value = cleanValue(rawValue);

  if (isGenericPlaceholder(value)) {
    return true;
  }

  return !/^sk-[A-Za-z0-9_-]{12,}/.test(value);
}

const findings = [];

for (const file of walk(root)) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const repoPath = toRepoPath(file);
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        const value = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
        if (!rule.isAllowed(value)) {
          findings.push(`${repoPath}:${index + 1}: secret-like ${rule.name} assignment`);
        }
      }
    }
  });
}

if (findings.length > 0) {
  console.error('Secret scan lite failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Secret scan lite passed: no non-placeholder secret assignments found.');
