# AWOS AGENT EVENT ROUTER — STAGING CHECKLIST
# Version: 1.0 | Status: LOCAL VALIDATED — AWAITING STAGING APPROVAL
# Approval ID: staging-event-router-v1.0 (in swarm_approvals table)

## LOCAL VALIDATION RESULTS ✅
- [x] Schema validation — 4 envelope tests PASSED
- [x] Routing logic — qa.regression, build.fail, sync routes correct
- [x] Idempotency deduplication — 2 duplicates correctly skipped
- [x] Dead-letter routing — invalid topic correctly dead-lettered
- [x] Supabase table existence — all 11 required tables confirmed
- [x] match_documents RPC — deployed to production (safe, additive)
- [x] rag_embeddings table — created (safe, additive)

## STAGING GATE ITEMS (need Jeremy approval)

### GCP Setup Required
- [ ] GCP Project: strategic-minds-swarm-os (or use existing)
- [ ] Enable APIs: pubsub.googleapis.com, run.googleapis.com
- [ ] Service Account: swarm-event-router@<project>.iam.gserviceaccount.com
- [ ] IAM: roles/pubsub.subscriber + roles/run.invoker
- [ ] Secret: SUPABASE_SERVICE_ROLE_KEY in Secret Manager

### Pub/Sub Topics (7)
- [ ] agent.events
- [ ] agent.commands
- [ ] agent.receipts
- [ ] agent.memory.write
- [ ] agent.approvals
- [ ] agent.alerts
- [ ] agent.deadletters (dead-letter topic)

### Cloud Run Deployment
- [ ] Deploy router.ts as Cloud Run preview service
- [ ] Environment: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
- [ ] Push subscription: agent.alerts → Cloud Run /route
- [ ] Test: POST /route with qa.regression.detected fixture

### Supabase Staging Branch
- [ ] Create branch: staging-event-router
- [ ] Apply: migrations/001_event_bus_tables.sql
- [ ] Verify: all tables exist
- [ ] RLS check: no permissive policies
- [ ] Run Supabase advisors — must be clean

### Smoke Test (staging only)
- [ ] Publish qa.regression.detected fixture
- [ ] Verify agent_inbox: 2 rows (validator, website-builder)
- [ ] Verify bridge_receipts: 1 row (router delivery receipt)
- [ ] Verify swarm_approvals: NOT triggered (requires_approval=false for QA)
- [ ] Verify no production tables modified

### Production Promotion Gate
- [ ] All smoke tests pass
- [ ] Supabase advisors clean
- [ ] Jeremy explicit approval (jeremy-bridge channel)
- [ ] THEN: apply migration to production Supabase
- [ ] THEN: promote Cloud Run preview → production

## FILES IN THIS PACKET
- router.ts — Cloud Run event router (TypeScript)
- agent_sdk.ts — Agent SDK (publish, claim, receipt, memory, heartbeat)
- migrations/001_event_bus_tables.sql — Staging migration
- scripts/validate.sh — Local validation (already run)
- STAGING_CHECKLIST.md — This file

## WHAT THE ROUTER DOES (narrow scope, per AUTO_BUILDER recommendation)
✅ Routes events → agent_inbox (correct recipients)
✅ Creates bridge_tasks for commands
✅ Writes bridge_receipts after delivery
✅ Opens swarm_approvals for gated actions
❌ Does NOT execute protected work
❌ Does NOT write to production without approval
❌ Does NOT access secrets directly
