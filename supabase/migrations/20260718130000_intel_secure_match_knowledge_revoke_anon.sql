-- Intelligence layer (Sub-ticket 1A) — SECURITY CLAMP for match_knowledge.
--
-- FINDING (confirmed live 2026-07-18): public.match_knowledge is SECURITY DEFINER
-- (reads mes_knowledge_base as owner, bypassing RLS) and trusts its
-- `allowed_visibility text[]` argument verbatim — it never re-derives the caller's
-- visibility ceiling. Combined with the EXECUTE grant to anon + authenticated, an
-- anonymous PostgREST caller can retrieve ALL `internal` rows (the full 1,672-row
-- LinkedIn synthesis corpus, raw post_text) — and equally `member`/`paid` rows —
-- simply by calling the RPC directly with allowed_visibility := array['internal'].
-- Proven: `set role anon; select match_knowledge(<vec>,...,array['internal'])`
-- returned internal rows. The knowledge-search edge function clamps anon to
-- ['public'], but that clamp is bypassed by calling the RPC directly.
--
-- FIX (minimal, reversible): revoke EXECUTE from anon + authenticated. No
-- legitimate caller depends on those grants —
--   * knowledge-search edge fn  → calls with the SERVICE ROLE client
--   * generate-report (semanticMatches / fetchLinkedInSignal) → SERVICE ROLE
--   * src/** frontend           → no client-side match_knowledge call exists
-- service_role (and postgres) retain EXECUTE, so both edge-function paths and the
-- report pipeline are unaffected. The intended public entry point remains the
-- knowledge-search edge function, which derives allowed_visibility from caller auth.
--
-- Rollback: supabase/rollback/20260718130000_..._revert.sql (re-grants anon+authenticated).
-- (Renumbered from 20260718100000 to resolve a version collision with an unrelated
--  migration that merged to main first; this clamp never applied before the rename.)
-- Applies via the PR/merge flow only (CLAUDE.md §10); idempotent for replays.

REVOKE EXECUTE ON FUNCTION public.match_knowledge(vector, text, integer, double precision, jsonb, text[])
  FROM anon, authenticated;

COMMENT ON FUNCTION public.match_knowledge(vector, text, integer, double precision, jsonb, text[]) IS
  'Canonical hybrid (vector + tsvector + trigram) retrieval over mes_knowledge_base for MCPs/agents. '
  'Visibility enforced by the allowed_visibility argument, which the caller controls — so EXECUTE is '
  'granted to service_role only (revoked from anon/authenticated 2026-07-18, Sub-ticket 1A). Reach it '
  'via the knowledge-search edge function, which sets allowed_visibility from caller auth/plan.';
