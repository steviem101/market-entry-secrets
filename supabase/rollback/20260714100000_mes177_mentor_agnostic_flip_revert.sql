-- Reverse of 20260714100000_mes177_mentor_agnostic_flip.sql (MES-177 B4). Reference only.
-- Restores sector_agnostic from the precise per-row snapshot, then drops the snapshot column.
-- Only rows the migration actually flipped carry a non-null snapshot, so this cannot disturb the
-- 9 already-correct specialists or the 11 genuinely-agnostic mentors.

update public.community_members
   set sector_agnostic = sector_agnostic_pre_mes177
 where sector_agnostic_pre_mes177 is not null;

alter table public.community_members
  drop column if exists sector_agnostic_pre_mes177;
