alter table if exists public.eden_content_items
  add column if not exists content_key text;

alter table if exists public.eden_engagement_tickets
  add column if not exists ticket_key text;

alter table if exists public.eden_experiments
  add column if not exists experiment_key text;

alter table if exists public.eden_memory_entries
  add column if not exists memory_key text;

create unique index if not exists eden_content_items_content_key_uidx
  on public.eden_content_items(content_key)
  where content_key is not null;

create unique index if not exists eden_engagement_tickets_ticket_key_uidx
  on public.eden_engagement_tickets(ticket_key)
  where ticket_key is not null;

create unique index if not exists eden_experiments_experiment_key_uidx
  on public.eden_experiments(experiment_key)
  where experiment_key is not null;

create unique index if not exists eden_memory_entries_memory_key_uidx
  on public.eden_memory_entries(memory_key)
  where memory_key is not null;

create index if not exists eden_content_items_schedule_idx
  on public.eden_content_items(scheduled_for, approval_state, connector_state);

create index if not exists eden_memory_entries_created_idx
  on public.eden_memory_entries(created_at desc);
