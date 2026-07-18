-- Rollback for 20260718130000_intel_secure_match_knowledge_revoke_anon.sql
-- Restores the pre-clamp grant surface: anon + authenticated regain EXECUTE on
-- match_knowledge. WARNING: this re-opens the visibility bypass documented in the
-- forward migration (anon can request allowed_visibility := ['internal']). Only
-- apply if the clamp must be reverted.

GRANT EXECUTE ON FUNCTION public.match_knowledge(vector, text, integer, double precision, jsonb, text[])
  TO anon, authenticated;

COMMENT ON FUNCTION public.match_knowledge(vector, text, integer, double precision, jsonb, text[]) IS
  'Canonical hybrid (vector + tsvector + trigram) retrieval over mes_knowledge_base for MCPs/agents. '
  'Visibility enforced internally; allowed_visibility defaults to {public}. Call via the knowledge-search '
  'edge function, which sets allowed_visibility from caller auth/plan.';
