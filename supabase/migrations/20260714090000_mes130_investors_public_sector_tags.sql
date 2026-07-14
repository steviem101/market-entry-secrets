-- MES-130: expose canonical sector tags on investors_public
--
-- investors_public is the PII-masking read boundary for the admin-locked
-- `investors` base table (SECURITY DEFINER, owner postgres — see
-- 20260706102500_mes56_pii_read_exposure_lockdown.sql). MES-110 already
-- populated investors.sector_tags (canonical LinkedIn-industry slugs) on
-- 451/499 rows, but the view never exposed it, so the Investors sector filter
-- still fell back to the 113-value free-text sector_focus.
--
-- This migration recreates the view adding TWO non-PII taxonomy columns —
-- sector_tags (text[]) and sector_agnostic (bool). It exposes no new PII:
-- contact_email/phone and every other admin-only column stay excluded exactly
-- as before. The column list is the existing view verbatim + the two additions
-- appended at the end (CREATE OR REPLACE requires additive-only column changes).
--
-- ADDITIVE + REVERSIBLE. Rollback = recreate the view without the two columns.
-- Post-apply (human, per docs/migrations.md): run get_advisors before/after and
-- confirm no NEW exposure findings (the definer-view advisory finding is the
-- accepted, documented masking pattern), and that /investors still renders.

CREATE OR REPLACE VIEW public.investors_public AS
SELECT
  id,
  slug,
  name,
  description,
  investor_type,
  location,
  website,
  logo,
  sector_focus,
  stage_focus,
  check_size_min,
  check_size_max,
  basic_info,
  why_work_with_us,
  is_featured,
  created_at,
  updated_at,
  currently_investing,
  leads_deals,
  country,
  application_url,
  fund_size,
  year_fund_closed,
  portfolio_companies,
  meta_title,
  meta_description,
  sector_tags,
  sector_agnostic
FROM public.investors;

-- Preserve the masking-view guarantees (idempotent; matches MES-56).
ALTER VIEW public.investors_public SET (security_invoker = 'false');
ALTER VIEW public.investors_public OWNER TO postgres;
GRANT SELECT ON public.investors_public TO anon;
GRANT SELECT ON public.investors_public TO authenticated;
GRANT SELECT ON public.investors_public TO service_role;
