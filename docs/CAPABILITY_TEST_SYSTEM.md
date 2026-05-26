# Capability Test System

## Purpose
Measure what AUTO BUILDER can actually do today, not what the architecture hopes to do later.

## Test classes
- route classification
- template assembly
- connector readiness
- reverse-engineering coverage
- hardening readiness

## Readiness doctrine
Every capability must be tagged as one of:
- Ready
- Partial
- Blocked

If blocked, the system must return:
- the blocker
- the strongest fallback
- the next enabling action
- whether approval is needed

## Required connector checks
- GitHub write path
- Vercel preview path
- Supabase migration path
- Shopify sandbox path
- OpenAI eval path
- Codex patch path
- Playwright smoke path
- Xyla draft path
- Opus repurposing path
- Slack approval path

## Required hardening checks
- schema dry run
- RLS audit
- route smoke
- frontend render smoke
- job replay
- dead-letter handling
- approval gate test
- preview smoke
- rollback existence
- secrets scan

## Passive use while offline
This system is designed to run safely while the operator sleeps by checking:
- readiness drift
- connector failures
- workaround availability
- missing receipts
- queue health
- reverse-engineering opportunities

## Live rule
No capability test should perform irreversible live mutation unless the relevant approval gate has already passed.
