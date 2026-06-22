-- ============================================================================
-- Phase 4 / Content Creator side: kb_sync_source read-only view
-- Scope: rcgaviwbsudouvfwzydq (MES Content Creator) ONLY.
-- ============================================================================
-- SCHEMA VERIFIED LIVE 2026-06-22 against public.linkedin_posts (3,814 rows,
-- 100% embedded). Column mapping below is confirmed real.
--
-- IMPORTANT: quality_score is on a 0-100 scale (min 1, avg 64, max 100), NOT
-- 0-1. Gate set to >= 70 => top ~44% (1,672 posts). Tunable: 60 (=2,357, more
-- recall) / 80 (=1,000, higher precision).
--
-- Security model (intentional): a Postgres view runs with the VIEW OWNER's
-- privileges by default (NOT security_invoker), so granting SELECT to `anon`
-- exposes ONLY these whitelisted columns/rows to the anon key, without making
-- the base linkedin_posts table anon-readable. Same controlled cross-project
-- mechanism mes-context uses in reverse. No PII columns are exposed.
-- ============================================================================

create or replace view public.kb_sync_source as
select
  id::text                          as source_ref,        -- uuid PK -> stable external ref
  post_text                         as content,           -- text to embed/retrieve (NOT NULL)
  null::text                        as title,             -- LinkedIn posts have no title
  embedding                         as embedding,         -- vector(1536), copied as-is
  post_url                          as post_url,
  post_date                         as post_date,
  engagement_score                  as engagement_score,  -- numeric
  quality_score                     as quality_score,     -- numeric, 0-100
  content_types                     as content_types,     -- text[]
  coalesce(updated_at, post_date)   as synced_at          -- incremental-sync watermark
from public.linkedin_posts
where embedding is not null
  and quality_score >= 70;          -- product-worthy gate (0-100 scale)

-- Least-privilege grant: read-only, anon, this view only.
grant select on public.kb_sync_source to anon;

-- DOWN (revert): drop view if exists public.kb_sync_source;
