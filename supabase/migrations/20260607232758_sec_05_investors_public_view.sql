-- Workstream A2: investors.contact_email + contact_name + linkedin_url are publicly readable.
-- Create a public view exposing only safe columns. Column grants on the base table are applied
-- in 20260607232915_sec_07_column_grants_anon.sql.

CREATE OR REPLACE VIEW public.investors_public
  WITH (security_invoker = true) AS
  SELECT
    id, slug, name, description, investor_type, location,
    website, logo, sector_focus, stage_focus,
    check_size_min, check_size_max,
    basic_info, why_work_with_us, is_featured,
    created_at, updated_at,
    currently_investing, leads_deals, country,
    application_url, fund_size, year_fund_closed,
    portfolio_companies, meta_title, meta_description
  FROM public.investors;

GRANT SELECT ON public.investors_public TO anon, authenticated;
