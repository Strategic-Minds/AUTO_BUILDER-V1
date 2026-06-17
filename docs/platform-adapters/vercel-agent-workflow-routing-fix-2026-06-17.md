# Vercel Workflow And Agent Tool Routing Fix - 2026-06-17

## Problem

During Eden Growth OS implementation, Auto Builder MCP accepted the job but direct Vercel workflow and Vercel Agent provisioning calls returned planning/stub results instead of using the platform provisioning runner.

Observed behavior:

- `create_vercel_workflow` could return `not_implemented` on connector surfaces that still used `createVercelWorkflowTool` directly.
- `create_vercel_agent` returned `not_implemented` because both strict and minimal MCP routes called the stub `createVercelAgentTool` directly.

## Fix

The MCP route surfaces now route Vercel workflow and agent tool calls through `runPlatformProvisioningJobTool` with explicit actions:

- `create_vercel_workflow` -> `runPlatformProvisioningJobTool(..., actions: ['create_vercel_workflow'])`
- `create_vercel_agent` -> `runPlatformProvisioningJobTool(..., actions: ['create_vercel_agent'])`

Updated files:

- `src/app/api/mcp/route.ts`
- `src/app/api/mcp-minimal/[transport]/route.ts`

## Governance

The tools remain dry-run-first. Live execution still requires:

- `mode=execute`
- `approved_actions` containing the requested action
- provider tokens available in the Auto Builder deployment environment

Protected actions remain blocked unless explicitly approved.

## Eden Growth OS Relevance

This fix allows Eden Growth OS implementation jobs to use Auto Builder as the orchestration layer for Vercel workflow/cron and Vercel Agent provisioning plans instead of receiving stub-only adapter responses.

## Remaining Note

The current platform provisioning runner has a GitHub-backed Vercel workflow adapter for `vercel.json` cron updates. Vercel Agent provisioning still routes through platform provisioning planning unless a provider-specific Vercel Agent API adapter is added later.
