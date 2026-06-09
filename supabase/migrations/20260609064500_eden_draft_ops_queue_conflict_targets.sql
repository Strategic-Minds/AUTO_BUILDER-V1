create unique index if not exists eden_content_items_content_key_conflict_uidx
  on public.eden_content_items(content_key);

create unique index if not exists eden_engagement_tickets_ticket_key_conflict_uidx
  on public.eden_engagement_tickets(ticket_key);

create unique index if not exists eden_experiments_experiment_key_conflict_uidx
  on public.eden_experiments(experiment_key);

create unique index if not exists eden_memory_entries_memory_key_conflict_uidx
  on public.eden_memory_entries(memory_key);
