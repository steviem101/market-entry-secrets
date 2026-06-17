-- Mentors remediation WS-A1: anonymity override columns + market_corridors.
-- Additive and idempotent; no existing data is modified. market_corridors is
-- populated by the WS-B backfill migration and consumed by the masking view.
-- (Applied to prod 2026-06-14 as 20260614101917_add_community_member_anonymity_columns.)
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS anonymous_alias         text,
  ADD COLUMN IF NOT EXISTS anonymous_company_label text,
  ADD COLUMN IF NOT EXISTS anonymous_headline      text,
  ADD COLUMN IF NOT EXISTS anonymous_bio           text,
  ADD COLUMN IF NOT EXISTS market_corridors        text[];
