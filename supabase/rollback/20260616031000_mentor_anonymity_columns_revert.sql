-- Revert Mentors remediation WS-A1.
-- NOTE: the masking view (WS-A2) references market_corridors, so run the
-- WS-A2 revert (20260616031100_mentor_public_view_masking_revert.sql) first.
ALTER TABLE public.community_members
  DROP COLUMN IF EXISTS anonymous_alias,
  DROP COLUMN IF EXISTS anonymous_company_label,
  DROP COLUMN IF EXISTS anonymous_headline,
  DROP COLUMN IF EXISTS anonymous_bio,
  DROP COLUMN IF EXISTS market_corridors;
