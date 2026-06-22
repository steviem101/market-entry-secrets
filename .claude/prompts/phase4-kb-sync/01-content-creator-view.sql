-- ============================================================================
-- Phase 4 / Content Creator side: kb_sync_source read-only view
-- Scope: rcgaviwbsudouvfwzydq (Content Creator) ONLY.
-- ============================================================================
-- STAGED DRAFT — written against the master-spec's documented linkedin_posts
-- shape. After the project transfer, VERIFY the real column names live:
--   select column_name, data_type from information_schema.columns
--   where table_schema='public' and table_name='linkedin_posts' order by 1;
-- ...and adjust the source-column mappings below. The OUTPUT contract (the
-- aliased column list) is what the MES kb-sync function depends on, so keep the
-- output names stable even if the underlying columns differ.
--
-- Security model (intentional): a Postgres view runs with the VIEW OWNER's
-- privileges by default (NOT security_invoker), so granting SELECT to `anon`
-- exposes ONLY these whitelisted columns/rows to the anon key, without making
-- the base linkedin_posts table anon-readable. This is the same controlled
-- cross-project mechanism mes-context uses in reverse. Do NOT add PII columns.
-- ============================================================================

create or replace view public.kb_sync_source as
select
  id::text                                  as source_ref,    -- stable external id
  post_text                                 as content,       -- text to embed/retrieve
  null::text                                as title,         -- LinkedIn posts have no title
  embedding                                 as embedding,     -- vector(1536), copied as-is
  post_url                                  as post_url,
  post_date                                 as post_date,
  engagement_score                          as engagement_score,
  quality_score                             as quality_score,
  content_types                             as content_types,
  -- Incremental-sync watermark. Prefer a real updated_at if linkedin_posts has
  -- one; fall back to post_date so the first run still works.
  coalesce(updated_at, post_date)           as synced_at
from public.linkedin_posts
where embedding is not null
  and quality_score >= 0.6;   -- quality gate: only product-worthy posts (tune)

-- Least-privilege grant: read-only, anon, this view only.
grant select on public.kb_sync_source to anon;

-- DOWN (revert): drop view if exists public.kb_sync_source;
