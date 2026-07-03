-- AUTO_BUILDER V1 Autonomous Package Loop rollback draft
-- Date: 2026-07-03
-- Governance: rollback draft only. Do not apply to production until reviewed,
-- staging-tested, receipt-backed, and explicitly approved by the operator.
-- Purpose: remove the automation control-plane tables introduced by
-- 20260703110000_autonomous_package_loop.sql if staging validation fails.

-- Do not apply to production without a current backup/restore point and approval receipt.

drop policy if exists automation_receipts_service_role_all on automation_receipts;
drop policy if exists automation_approvals_service_role_all on automation_approvals;
drop policy if exists automation_package_candidates_service_role_all on automation_package_candidates;
drop policy if exists automation_hardening_queue_service_role_all on automation_hardening_queue;
drop policy if exists automation_repair_queue_service_role_all on automation_repair_queue;
drop policy if exists automation_scorecards_service_role_all on automation_scorecards;
drop policy if exists automation_jobs_service_role_all on automation_jobs;
drop policy if exists automation_runs_service_role_all on automation_runs;
drop policy if exists automation_queue_service_role_all on automation_queue;

drop table if exists automation_receipts;
drop table if exists automation_approvals;
drop table if exists automation_package_candidates;
drop table if exists automation_hardening_queue;
drop table if exists automation_repair_queue;
drop table if exists automation_scorecards;
drop table if exists automation_jobs;
drop table if exists automation_runs;
drop table if exists automation_queue;
