-- Watermark + run state for the Content Creator -> mes_knowledge_base sync.
-- Scope: xhziwveaiuhzdoutpgrh (MES - Australia) ONLY.
create table if not exists public.kb_sync_state (
  source           text primary key,
  last_synced_at   timestamptz not null default '1970-01-01T00:00:00Z',
  last_run_at      timestamptz,
  last_rows_synced integer not null default 0
);
alter table public.kb_sync_state enable row level security;  -- service-role only
revoke all on public.kb_sync_state from anon;
revoke all on public.kb_sync_state from authenticated;
insert into public.kb_sync_state (source) values ('content_creator_linkedin')
  on conflict (source) do nothing;
