-- MES-177 Phase B4: restore the MES-110 invariant (sector-tagged ⇒ not sector_agnostic) for the
-- 114 mentors that carry both — a residue of an indiscriminate import default (93% of
-- community_members rows were sector_agnostic=true). See docs/audits/mes-177/B4-mentor-agnostic-review.md.
--
-- Properties: guarded · idempotent · precisely reversible · preview-safe (no-op on empty DB).
-- Behavioural effect: report matcher scoring (generate-report/matchScoring.ts). No RLS/policy,
-- grant, payment, or frontend change. NOTE the UPDATE also fires the community_members KB-sync
-- trigger (trg_kb_generic -> upsert_kb_mentor), re-embedding the 114 mentors in mes_knowledge_base
-- (~114 OpenAI embeds via the embed-knowledge cron) — harmless (rebuildable index, exception-guarded
-- trigger, re-runs are 0-row) but not literally "matcher only". community_members RLS already
-- restricts writes to service role; this runs as the migration role.

-- 1. Reversibility snapshot. Nullable; populated only for the flipped rows. The
--    community_members_public view uses an explicit column list that does NOT select
--    this column, so it is not exposed. Idempotent (add-if-missing).
alter table public.community_members
  add column if not exists sector_agnostic_pre_mes177 boolean;

-- 2. Flip tagged + agnostic mentors, recording the prior value. The predicate is the
--    exact 114-row violation set; the `pre_mes177 is null` latch makes re-runs no-ops for
--    already-flipped rows (while still correcting any NEW tagged+agnostic row a future
--    import introduces — the invariant stays enforced). No-op on an empty preview DB.
update public.community_members
   set sector_agnostic_pre_mes177 = sector_agnostic,
       sector_agnostic            = false
 where sector_tags is not null
   and cardinality(sector_tags) > 0
   and sector_agnostic is true
   and sector_agnostic_pre_mes177 is null;

-- Expected effect at apply time (verified 2026-07-14): 114 rows flipped; 9 already-false
-- tagged rows untouched; 11 untagged-agnostic rows (empty {} sector_tags) untouched.

-- Reverse (supabase/rollback/):
--   update public.community_members
--      set sector_agnostic = sector_agnostic_pre_mes177
--    where sector_agnostic_pre_mes177 is not null;
--   alter table public.community_members drop column sector_agnostic_pre_mes177;
