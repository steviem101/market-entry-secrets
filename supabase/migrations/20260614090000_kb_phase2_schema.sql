-- Phase 2: unified RAG knowledge base (derived search layer over MES source tables).
-- Source tables remain the system of record; this table is fully rebuildable from them.
-- Reversible: supabase/rollback/20260614090000_kb_phase2_schema_revert.sql
-- Idempotent: safe to replay (CLI db push) even though first applied via MCP.
-- vector/pg_trgm live in `public` on the source project but in `extensions` on a fresh
-- Supabase branch; search both so vector(1536) + the HNSW opclass resolve either way.
set search_path = public, extensions;

create table if not exists public.mes_knowledge_base (
  id              uuid primary key default gen_random_uuid(),
  source_table    text not null,
  source_id       uuid not null,
  chunk_index     int  not null default 0,
  entity_type     text not null,
  title           text,
  content         text not null,
  metadata        jsonb not null default '{}'::jsonb,
  content_hash    text not null,
  embedding       vector(1536),
  embedded_hash   text,
  embedding_model text default 'text-embedding-3-small',
  updated_at      timestamptz not null default now(),
  unique (source_table, source_id, chunk_index)
);

create index if not exists mes_kb_embedding_idx on public.mes_knowledge_base
  using hnsw (embedding vector_cosine_ops);
create index if not exists mes_kb_metadata_idx on public.mes_knowledge_base using gin (metadata);
create index if not exists mes_kb_fts_idx on public.mes_knowledge_base
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || content));
create index if not exists mes_kb_stale_idx on public.mes_knowledge_base (id)
  where embedding is null or embedded_hash is distinct from content_hash;
create index if not exists mes_kb_source_idx on public.mes_knowledge_base (source_table, source_id);

create table if not exists public.knowledge_embed_log (
  id             uuid primary key default gen_random_uuid(),
  run_started    timestamptz not null default now(),
  batch_size     int,
  embedded_count int not null default 0,
  failed_count   int not null default 0,
  error          text,
  finished       timestamptz
);

-- Security: derived layer is service-role-write + definer-RPC-read only.
-- No anon/authenticated grants => the ONLY read path is the match_knowledge() definer RPC,
-- which enforces visibility internally (clients can never bypass it via direct table reads).
-- (The resulting `rls_enabled_no_policy` advisor INFO on these two tables is intentional.)
alter table public.mes_knowledge_base enable row level security;
alter table public.knowledge_embed_log enable row level security;
revoke all on public.mes_knowledge_base from anon, authenticated;
revoke all on public.knowledge_embed_log from anon, authenticated;
grant select, insert, update, delete on public.mes_knowledge_base to service_role;
grant select, insert, update, delete on public.knowledge_embed_log to service_role;

comment on table public.mes_knowledge_base is
  'Unified RAG search layer over MES customer-facing entities. Derived/rebuildable; source tables are the system of record. Read only via match_knowledge() RPC; written by upsert_kb_* triggers + embed-knowledge edge fn. MES project only.';
comment on column public.mes_knowledge_base.metadata is
  'Stable agent-filterable keys ONLY: sector (jsonb array), country (text|null), visibility (public|member|paid), is_active (bool), source_url (text), plan_tier (free|growth|scale|enterprise|null).';
comment on column public.mes_knowledge_base.content is
  'Embeddable text, PII-stripped (no emails/phones/personal contact fields).';
comment on column public.mes_knowledge_base.embedded_hash is
  'content_hash at time of embedding. Row is stale (needs re-embed) when embedded_hash is distinct from content_hash.';
