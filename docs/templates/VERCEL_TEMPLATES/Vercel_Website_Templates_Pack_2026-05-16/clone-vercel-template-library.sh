#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-website-templates}"
mkdir -p \
  "$ROOT/01-saas" \
  "$ROOT/02-b2b" \
  "$ROOT/03-content-creation" \
  "$ROOT/04-workflow" \
  "$ROOT/05-agents" \
  "$ROOT/06-crons" \
  "$ROOT/07-sandbox" \
  "$ROOT/08-v0"

clone_once() {
  local repo="$1"
  local dest="$2"
  if [ -d "$dest/.git" ]; then
    echo "SKIP: $dest already exists"
  else
    echo "CLONE: $repo -> $dest"
    git clone "https://github.com/$repo.git" "$dest"
  fi
}

clone_once "nextjs/saas-starter" "$ROOT/01-saas/nextjs-saas-starter"
clone_once "updatedotdev/nextjs-supabase-stripe-update" "$ROOT/01-saas/update-saas-starter"
clone_once "stack-auth/multi-tenant-starter-template" "$ROOT/02-b2b/multi-tenant-starter"
clone_once "muxinc/nextjs-video-ai-workflows" "$ROOT/03-content-creation/mux-ai-video-workflows"
clone_once "remotion-dev/template-vercel" "$ROOT/03-content-creation/remotion-vercel"
clone_once "vercel-labs/workflow-builder-template" "$ROOT/04-workflow/workflow-builder"
clone_once "vercel-labs/tersa" "$ROOT/04-workflow/tersa"
clone_once "vercel-labs/coding-agent-template" "$ROOT/05-agents/coding-agent-template"
clone_once "vercel-labs/open-agents" "$ROOT/05-agents/open-agents"
clone_once "vercel-labs/openai-agents-python-template" "$ROOT/05-agents/openai-agents-python-template"
clone_once "vercel/examples" "$ROOT/06-crons/vercel-examples"
clone_once "vercel-labs/openai-agents-python-template" "$ROOT/07-sandbox/openai-agents-python-template"
clone_once "remotion-dev/template-vercel" "$ROOT/07-sandbox/remotion-vercel"
clone_once "vercel/v0-sdk" "$ROOT/08-v0/v0-sdk"

echo
echo "Done. Template library created in: $ROOT"
echo "Cron example path: $ROOT/06-crons/vercel-examples/solutions/cron"
