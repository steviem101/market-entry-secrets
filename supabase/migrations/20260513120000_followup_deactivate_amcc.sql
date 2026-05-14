-- Follow-up 1: deactivate the Australia Malaysia Chamber of Commerce (AMCC) row.
-- The Phase 3 research sub-agent confirmed this organisation does not exist
-- as a real bilateral body — the listed website (arvensystech.com) was
-- unrelated to AU-MY trade, and the legitimate AU-MY body is the separate
-- "Australia Malaysia Business Council (NSW Chapter)" row.
--
-- We keep the row (rather than hard-deleting) so any external references
-- by id continue to resolve cleanly, but it's excluded from the directory
-- via is_active=false.

UPDATE trade_investment_agencies
SET
  is_active = false,
  needs_re_research = false,
  last_updated_at = now(),
  updated_at = now()
WHERE slug = 'australia-malaysia-chamber-of-commerce-amcc';
