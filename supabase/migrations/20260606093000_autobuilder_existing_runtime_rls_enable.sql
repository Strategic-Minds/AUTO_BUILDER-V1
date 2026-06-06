-- AUTO BUILDER OS v1 existing runtime RLS repair
-- Branch-safe repair for existing public runtime tables that receive service-role policies.
-- Do not apply to production until operator approval is recorded.

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    '_autobuilder_probe','agent_heartbeats','ai_tasks','ai_execution_logs','ai_system_events','ai_revenue_events','ai_content_queue','ai_model_runs','ai_guardrail_events','ai_approval_queue','bridge_commands','bridge_tasks','bridge_claims','bridge_evidence','bridge_blockers','bridge_next_prompts','browser_tasks','browser_claims','browser_evidence','browser_blockers','browser_screenshots','queue_metrics','execution_traces','playwright_sessions','model_invocations','worker_states','notification_bridge','worker_heartbeats','social_media_bridge','shopify_commerce_bridge','web_research_bridge','lead_generation_bridge','financial_simulation_bridge','rollback_events','rollback_requests','scheduler_verification'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      policy_name := table_name || '_service_role_all';
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      execute format('create policy %I on public.%I for all to service_role using (true) with check (true)', policy_name, table_name);
    end if;
  end loop;
end $$;
