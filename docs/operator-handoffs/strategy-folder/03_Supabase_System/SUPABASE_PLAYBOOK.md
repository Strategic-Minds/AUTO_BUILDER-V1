# Supabase Playbook

## Purpose
Supabase stores state, queues, manifests, approvals, memory, intelligence, receipts, QA scores, communications, and client delivery status.

## Required steps
1. Create staging Supabase project or staging schema.
2. Review `MASTER_SCHEMA_PATCH.sql`.
3. Apply in staging only.
4. Add tenant-specific RLS policies.
5. Add service role only to Vercel server runtime, never client/browser.
6. Validate schema with QA stage 3.
7. Promote only after approval.

## Memory libraries
- universal_business_intelligence
- epoxy_decorative_concrete_polished_concrete_intelligence
- client_industry_intelligence
- project_source_truth

## Queue names
- intake.pending
- discovery.pending
- competitive_intel.pending
- strategy.pending
- approval.waiting
- builder_docs.pending
- drive_scaffold.pending
- github.pending
- supabase.pending
- vercel.pending
- qa.pending
- autoheal.pending
- release_review.pending
- client_handoff.pending
- archive.pending
