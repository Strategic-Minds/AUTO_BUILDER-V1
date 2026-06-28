create or replace function public.set_epoxy_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create policy "service_role_only_epoxy_queue"
    on public.epoxy_queue
    for all
    using (false)
    with check (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "service_role_only_epoxy_failed_jobs"
    on public.epoxy_failed_jobs
    for all
    using (false)
    with check (false);
exception when duplicate_object then null; end $$;
