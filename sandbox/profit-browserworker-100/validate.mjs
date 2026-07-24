import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const containsAll = (content, values) => values.every((value) => content.includes(value));

const paths = {
  directive: "docs/gpt/PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md",
  master: "docs/gpt/MASTER_INVOCATION_PROMPT.md",
  startup: "docs/gpt-business-account/START_EVERY_REQUEST_HERE.md",
  custom: "docs/gpt-business-account/MANDATORY_READ_CUSTOM_INSTRUCTIONS_UNDER_1499.md",
  installReceipt: "03_Bridge_Receipts/mcp/RECEIPT_PROFIT_BROWSERWORKER_DIRECTIVE_20260724.md",
  rollbackReceipt: "03_Bridge_Receipts/rollback/ROLLBACK_PROFIT_BROWSERWORKER_DIRECTIVE_20260724.md",
  workflow: ".github/workflows/sandbox-profit-browserworker-100.yml",
  vercel: "vercel.json",
  scorecard: "sandbox/profit-browserworker-100/scorecard.json"
};

const requiredFiles = Object.values(paths);
for (const file of requiredFiles) {
  if (!exists(file)) {
    console.error(`SANDBOX_100: missing required file: ${file}`);
    process.exit(1);
  }
}

const directive = read(paths.directive);
const master = read(paths.master);
const startup = read(paths.startup);
const custom = read(paths.custom);
const installReceipt = read(paths.installReceipt);
const rollbackReceipt = read(paths.rollbackReceipt);
const workflow = read(paths.workflow);
const vercel = JSON.parse(read(paths.vercel));
const scorecard = JSON.parse(read(paths.scorecard));

const checks = {
  C01: () => directive.includes("# STRATEGIC MINDS AUTO BUILDER OS"),
  C02: () => master.includes("PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md") && master.includes("Read"),
  C03: () => startup.includes("PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md"),
  C04: () => custom.includes("PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md") && [...custom].length <= 1499,
  C05: () => directive.includes("https://github.com/Strategic-Minds/BROWSERWORKER"),
  C06: () => containsAll(directive, ["Do not substitute", "XTREME-AI-SYSTEMS/browserworker"]),
  C07: () => containsAll(directive, ["Mandatory connector boot", "Google Drive", "GitHub", "Vercel", "Supabase"]),
  C08: () => directive.includes("PROFIT-FIRST AUTONOMOUS BUILD MODE"),
  C09: () => directive.includes("Approved-source fast lane"),
  C10: () => containsAll(directive, ["Existing-preview fast lane", "launch BrowserWorker"]),
  C11: () => directive.includes("99.00% minimum"),
  C12: () => directive.includes("100% of the approved operational acceptance matrix"),
  C13: () => containsAll(directive, ["desktop", "tablet", "mobile"]),
  C14: () => containsAll(directive, ["Recursive repair loop", "up to five repair cycles"]),
  C15: () => Array.isArray(vercel.crons) && vercel.crons.some((cron) => cron.schedule === "*/5 * * * *") && directive.includes("Vercel Workflow"),
  C16: () => directive.includes("Production release requires explicit operator approval"),
  C17: () => containsAll(directive, ["VERIFIED", "PARTIALLY VERIFIED", "INFERRED", "COULD NOT VERIFY", "FAILED", "BLOCKED"]),
  C18: () => installReceipt.includes("ABOS-PROFIT-BW-DIRECTIVE-20260724"),
  C19: () => rollbackReceipt.includes("Rollback: Profit-First BrowserWorker Directive"),
  C20: () => workflow.includes("node sandbox/profit-browserworker-100/validate.mjs")
};

const results = [];
let score = 0;

for (const item of scorecard.checks) {
  const passed = Boolean(checks[item.id]?.());
  if (passed) score += item.points;
  results.push({
    id: item.id,
    points: item.points,
    passed,
    description: item.description
  });
}

const report = {
  scorecard_id: scorecard.scorecard_id,
  scope: scorecard.scope,
  score,
  target_score: scorecard.target_score,
  status: score === scorecard.target_score ? "PASS" : "FAIL",
  custom_instruction_characters: [...custom].length,
  checks: results
};

console.log(JSON.stringify(report, null, 2));

if (score !== scorecard.target_score) {
  process.exit(1);
}
