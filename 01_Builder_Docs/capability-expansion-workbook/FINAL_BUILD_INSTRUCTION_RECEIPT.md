# AUTO_BUILDER OS GPT Capability Expansion Workbook - Final Build Instruction Receipt

PHASE: DISCOVERY -> DOCS HANDOFF
STEP: Paste WEB-VERIFIED SOURCE TRUTH PATCH into workbook-generation prompt and run as final workbook build instruction.

## Operator
Jeremy / Strategic Minds

## Source Workbook
`AUTO_BUILDER_OS_PROJECT_CHILD_WORKBOOK_FROM_PATCHED_MASTER(1).xlsx`

## Generated Workbook Artifact
`AUTO_BUILDER_OS_GPT_CAPABILITY_EXPANSION_WORKBOOK.xlsx`

## Generated Markdown Artifact
`AUTO_BUILDER_OS_GPT_CAPABILITY_EXPANSION_FINAL_BUILD_INSTRUCTION.md`

## Local Artifact Counts
- Workbook sheets: 30
- Existing child workbook sheets detected: 88
- Capability rows: 120
- Blocker rows: 81
- Prompt rows: 50
- Wealth system rows: 50
- Source truth rows: 12

## Web-Verified Source Truth Patch Inserted
The workbook-generation instruction was patched with current official-source constraints for:

1. GPT Builder / ChatGPT Business
   - GPTs can be configured with instructions, knowledge, capabilities, apps, actions, and version history.
   - Knowledge files are reference material, not behavior rules.
   - GPTs can attach up to 20 files, each up to 512 MB.
   - GPTs can use either apps or actions, but not both at the same time, unless current OpenAI docs later verify otherwise.

2. Codex
   - Codex is the coding-agent layer for writing, reviewing, and shipping code.
   - Codex web requires connecting ChatGPT to GitHub.
   - Codex usage varies by plan and task complexity.
   - Business, Enterprise, and Edu data controls must be respected.

3. Vercel Workflows / Cron / Sandbox / AI Gateway
   - Vercel Workflows are the durable multi-step runtime.
   - Vercel Cron is the scheduler for validator loops where plan/project support permits cadence.
   - Vercel Sandbox is the isolated execution layer for generated or untrusted code.
   - Vercel AI Gateway is the model routing, monitoring, and fallback layer.

4. GitHub Actions
   - GitHub Actions is the repo automation layer for CI/CD workflows stored in `.github/workflows`.

5. Autonomy Control Rule
   Every capability must be classified as one of:
   - READ ONLY
   - DRAFT ONLY
   - SANDBOX ONLY
   - PREVIEW ONLY
   - DRY_RUN ONLY
   - APPROVAL REQUIRED
   - PRODUCTION LOCKED

No workbook row may imply uncontrolled production mutation.

## Official Source URLs
- OpenAI GPT Builder: https://help.openai.com/en/articles/8554397-creating-a-gpt
- OpenAI Codex: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
- Vercel Workflows: https://vercel.com/docs/workflows
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Vercel Sandbox: https://vercel.com/docs/sandbox
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway
- GitHub Actions: https://docs.github.com/en/actions/get-started/understand-github-actions

## Governance Receipt
- Production mutation: No
- Secrets exposed: No
- Payment action: No
- Live customer messages: No
- Live deployment: No
- Branch-only GitHub write: Yes
- Branch: `docs-capability-expansion-20260707`

## Next Action
Review the generated workbook locally, then decide whether to open a PR from this branch or keep it as a docs handoff receipt only.
