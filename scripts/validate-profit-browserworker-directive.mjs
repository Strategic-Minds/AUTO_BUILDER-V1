import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  directive: "docs/gpt/PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md",
  master: "docs/gpt/MASTER_INVOCATION_PROMPT.md",
  startup: "docs/gpt-business-account/START_EVERY_REQUEST_HERE.md",
  custom: "docs/gpt-business-account/MANDATORY_READ_CUSTOM_INSTRUCTIONS_UNDER_1499.md",
  vercel: "vercel.json",
};

const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireText(label, content, expected) {
  if (!content.includes(expected)) {
    failures.push(`${label} missing required text: ${expected}`);
  }
}

const directive = read(files.directive);
const master = read(files.master);
const startup = read(files.startup);
const custom = read(files.custom);
const vercelRaw = read(files.vercel);

for (const expected of [
  "PROFIT-FIRST AUTONOMOUS BUILD MODE",
  "https://github.com/Strategic-Minds/BROWSERWORKER",
  "99.00%",
  "100% of the approved operational acceptance matrix",
  "*/5 * * * *",
  "Google Drive",
  "GitHub",
  "Vercel",
  "Supabase",
  "up to five repair cycles",
  "Production release requires explicit operator approval",
]) {
  requireText("directive", directive, expected);
}

for (const expected of [
  "PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md",
  "Strategic-Minds/BROWSERWORKER",
  "99.00%",
  "100% of the approved operational acceptance matrix",
  "*/5 * * * *",
]) {
  requireText("master prompt", master, expected);
}

for (const expected of [
  "Inspect Google Drive, GitHub, Vercel, and Supabase",
  "Start BrowserWorker validation immediately",
  "99.00% visual parity",
  "100% scoped operational parity",
  "*/5 * * * *",
]) {
  requireText("startup instruction", startup, expected);
}

for (const expected of [
  "PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md",
  "Strategic-Minds/BROWSERWORKER",
  "99.00%",
  "100% of the approved operational acceptance matrix",
  "*/5 * * * *",
]) {
  requireText("custom instructions", custom, expected);
}

const customLength = [...custom].length;
if (customLength > 1499) {
  failures.push(`custom instruction length ${customLength} exceeds 1499 characters`);
}

try {
  const vercel = JSON.parse(vercelRaw);
  const hasFiveMinuteCron = Array.isArray(vercel.crons) && vercel.crons.some(
    (cron) => cron && cron.schedule === "*/5 * * * *"
  );
  if (!hasFiveMinuteCron) {
    failures.push("vercel.json does not contain a five-minute cron");
  }
} catch (error) {
  failures.push(`vercel.json parse failed: ${error.message}`);
}

if (failures.length > 0) {
  console.error("PROFIT_BROWSERWORKER_DIRECTIVE_VALIDATION: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PROFIT_BROWSERWORKER_DIRECTIVE_VALIDATION: PASS");
console.log(`custom_instruction_characters=${customLength}`);
console.log("visual_parity_gate=99.00%");
console.log("operational_parity_gate=100%");
console.log("canonical_browserworker=Strategic-Minds/BROWSERWORKER");
console.log("five_minute_cron=present");
