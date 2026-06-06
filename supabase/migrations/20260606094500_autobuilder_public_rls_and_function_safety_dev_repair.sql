-- AUTO BUILDER OS dev-branch safety repair.
-- Scope: existing public automation tables only. Production merge remains approval-gated.

-- Lock function search_path for advisor-safe trigger helper execution.
do $$
begin
  if to_regprocedure('public.apply_updated_at_trigger(regclass)') is not null then
    execute 'alter function public.apply_updated_at_trigger(regclass) set search_path = public, pg_temp';
  end if;
end $$;

-- Enable RLS on existing automation tables and keep backend service-role access explicit.
do $$
declare
  table_name text;
  policy_name text;
  target_tables text[] := array[
    'ai_admin_reviews',
    'ai_notifications',
    'bridge_credentials',
    'eden_agent_runs',
    'eden_chat_sessions',
    'eden_model_profiles',
    'eden_skye_phase2_xyla_import_prep',
    'eden_social_drafts',
    'eden_wardrobe_states',
    'capability_gap_registry',
    'profit_score_registry',
    'recursive_memory_compression',
    'blocker_classifier',
    'next_task_ranker',
    'worker_watchdog',
    'budget_governor',
    'recursive_loop_deduper',
    'approval_gate_escalation_queue',
    'approval_queue',
    'escalation_events',
    'capability_router_bridge',
    'worker_registry_watchdog',
    'queue_control_events',
    'ai_work_queue',
    'ai_worker_runs',
    'ai_cost_ledger',
    'ai_proof_logs',
    'ai_revenue_experiments',
    'ai_products',
    'ai_approval_gates',
    'ai_simulated_accounts',
    'ai_simulated_portfolio',
    'ai_agent_decisions',
    'ai_agent_reflections'
  ];
begin
  foreach table_name in array target_tables loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      policy_name := table_name || '_service_role_all';
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        table_name
      );
    end if;
  end loop;
end $$;
