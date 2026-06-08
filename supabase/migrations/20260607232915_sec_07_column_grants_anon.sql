-- Refines A2/A3: use column-level grants so mes-context (Content Studio anon) can still read
-- safe columns from the base tables. Queries that select PII columns or `select=*` will 403.

DROP POLICY IF EXISTS "Authenticated can read community members" ON public.community_members;
DROP POLICY IF EXISTS "Everyone can view community members" ON public.community_members;
CREATE POLICY "Everyone can view community members" ON public.community_members
  FOR SELECT USING (true);

REVOKE SELECT ON public.community_members FROM anon;
GRANT SELECT (
  id, name, title, description, location, experience, specialties,
  image, company, is_anonymous, experience_tiles, created_at, updated_at,
  origin_country, associated_countries, location_id, slug, archetype,
  persona_fit, is_active, is_featured
) ON public.community_members TO anon;
-- Excluded from anon: contact, website

DROP POLICY IF EXISTS "Authenticated can read investors" ON public.investors;
DROP POLICY IF EXISTS "Anyone can read investors" ON public.investors;
CREATE POLICY "Anyone can read investors" ON public.investors
  FOR SELECT USING (true);

REVOKE SELECT ON public.investors FROM anon;
GRANT SELECT (
  id, slug, name, description, investor_type, location,
  website, logo, sector_focus, stage_focus,
  check_size_min, check_size_max, basic_info, why_work_with_us,
  is_featured, created_at, updated_at, currently_investing,
  leads_deals, country, application_url, fund_size, year_fund_closed,
  portfolio_companies, meta_title, meta_description
) ON public.investors TO anon;
-- Excluded from anon: contact_email, contact_name, linkedin_url, details
