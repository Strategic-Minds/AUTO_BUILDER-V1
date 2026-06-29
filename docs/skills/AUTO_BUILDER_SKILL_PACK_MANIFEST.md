# AUTO_BUILDER Skill Pack Manifest

## Included repo skills
1. auto-builder-governance
2. source-truth-discovery
3. brand-options-generator
4. builder-docs-generator
5. nextjs-fullstack-scaffold
6. supabase-system-scaffold
7. vercel-workflow-cron
8. ai-gateway-router
9. mcp-dry-run-validator
10. smoke-test-receipts
11. rollback-receipts
12. auto-social-pipeline
13. competitor-intelligence-queue

## Install path
Place the `.agents/skills` folder at the root of the Strategic-Minds/AUTO_BUILDER repo.

## Validation command ideas
- List skills: find .agents/skills -maxdepth 2 -name SKILL.md
- Inspect frontmatter: grep -R "^name:" .agents/skills
- Confirm governance: grep -R "PLAN -> DISCOVERY" .agents/skills AGENTS.md
