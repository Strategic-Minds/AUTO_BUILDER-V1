import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'docs/prompt-library/README.md',
  'docs/prompt-library/taxonomy.yaml',
  'docs/prompt-library/index.json',
  'docs/prompt-library/logging.md',
  'docs/prompt-library/prompts/ab-master-autonomous-build-001.md',
  'docs/prompt-library/prompts/ab-forensic-audit-001.md',
  'docs/prompt-library/prompts/ab-validation-loop-001.md',
  'docs/prompt-library/prompts/ab-packaging-handoff-001.md'
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing prompt library files:', missing.join(', '));
  process.exit(1);
}

const index = JSON.parse(readFileSync('docs/prompt-library/index.json', 'utf8'));
for (const prompt of index.prompts ?? []) {
  if (!existsSync(prompt.path)) {
    console.error(`Prompt index path missing: ${prompt.path}`);
    process.exit(1);
  }
}

const taxonomy = readFileSync('docs/prompt-library/taxonomy.yaml', 'utf8');
for (const marker of ['phases:', 'prompt_types:', 'trigger_classes:']) {
  if (!taxonomy.includes(marker)) {
    console.error(`Prompt taxonomy missing marker: ${marker}`);
    process.exit(1);
  }
}

console.log(`Prompt library validated: ${index.prompts?.length ?? 0} prompts indexed.`);
