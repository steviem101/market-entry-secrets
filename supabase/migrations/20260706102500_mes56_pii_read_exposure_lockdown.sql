-- MES-56 (audit S1/S2 / backlog T19): close PII read-exposure on
-- investors and agency_contacts, mirroring the community_members lockdown.
--
-- State going in (per 20260704095538_remote_baseline + 20260704164214):
--   * agency_contacts: anon SELECT already revoked, but ANY authenticated user
--     can read full_name/email/phone/linkedin_url ("Authenticated can view
--     agency contacts" USING (true) + intact authenticated SELECT grant).
--     agencies_report_view.primary_contacts also emits raw `email`, and the
--     invoker view now ERRORS for anon (its subqueries hit the revoked base).
--   * investors: "Anyone can read investors" USING (true) + full authenticated
--     SELECT grant exposes contact_email/contact_name/linkedin_url/details
--     (447 rows) to any signed-up user. anon holds column grants on the safe
--     columns only (SEC-07). investors_public is security_invoker, so it
--     inherits whatever the caller can see — it must become a masking boundary.
--
-- Pattern (same as community_members / community_members_public):
--   base table  -> admin-only SELECT policy + client SELECT grants revoked
--   masked view -> SECURITY DEFINER (owner postgres, RLS-exempt), excludes
--                  email/phone, granted to anon + authenticated
--
-- APPROVAL-GATED (RLS/grants, prod migration): prepared in the MES-56 PR; a
-- human applies it per docs/migrations.md and runs the Supabase security
-- advisors (get_advisors) BEFORE and AFTER, confirming no new exposure.
-- The advisor will flag the two definer views (security_definer_view) — that
-- is the accepted, documented masking pattern (audit S20, community_members
-- precedent): they exist precisely to read an admin-locked base as owner and
-- expose only masked columns.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. agency_contacts: admin-only base
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view agency contacts" ON public.agency_contacts;
DROP POLICY IF EXISTS "Authenticated can view agency contacts" ON public.agency_contacts;
CREATE POLICY "Admins can view agency contacts"
  ON public.agency_contacts FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'::public.app_role));

REVOKE SELECT ON TABLE public.agency_contacts FROM anon;
REVOKE SELECT ON TABLE public.agency_contacts FROM authenticated;
-- Re-grant so the admin-only policy (not a missing grant) is the boundary for
-- admin dashboards; non-admins are stopped by RLS. Mirrors community_members.
GRANT SELECT ON TABLE public.agency_contacts TO authenticated;

-- Masked public view: everything the directory UI renders (name/title/
-- LinkedIn/avatar/ordering/tier) but NEVER email or phone.
CREATE OR REPLACE VIEW public.agency_contacts_public
WITH (security_invoker = 'false') AS
SELECT
  id,
  agency_id,
  full_name,
  title,
  linkedin_url,
  avatar_url,
  is_primary,
  display_order,
  is_archived,
  mes_relevance_score,
  tier,
  created_at
FROM public.agency_contacts;

ALTER VIEW public.agency_contacts_public OWNER TO postgres;
GRANT SELECT ON public.agency_contacts_public TO anon;
GRANT SELECT ON public.agency_contacts_public TO authenticated;
GRANT SELECT ON public.agency_contacts_public TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. agencies_report_view: stop emitting contact email; read the masked view
--    so the (invoker) view works for anon again instead of erroring on the
--    locked base table. Output columns are unchanged except that the
--    primary_contacts JSON objects no longer carry an `email` key.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.agencies_report_view
WITH (security_invoker = 'true') AS
SELECT
  tia.id,
  tia.name,
  tia.slug,
  tia.tagline,
  tia.description,
  tia.description_full,
  tia.logo,
  tia.website_url,
  tia.website,
  tia.email,
  tia.phone,
  tia.linkedin_url,
  tia.organisation_type,
  tia.government_level,
  tia.category_slug,
  oc.name AS category_name,
  oc.icon AS category_icon,
  oc.colour AS category_colour,
  tia.jurisdiction,
  tia.sectors_supported,
  tia.support_types,
  tia.target_company_origin,
  tia.target_company_stage,
  tia.is_government_funded,
  tia.is_free_to_access,
  tia.membership_required,
  tia.membership_fee_aud,
  tia.grants_available,
  tia.max_grant_aud,
  tia.location,
  tia.location_city,
  tia.location_state,
  tia.location_country,
  tia.has_multiple_locations,
  tia.founded,
  tia.founded_year,
  tia.employees,
  tia.is_verified,
  tia.is_featured,
  tia.is_active,
  tia.view_count,
  tia.meta_title,
  tia.meta_description,
  tia.last_updated_at,
  tia.services,
  tia.basic_info,
  tia.why_work_with_us,
  tia.contact,
  tia.contact_persons,
  tia.experience_tiles,
  tia.domain,
  tia.country_iso2,
  (SELECT json_agg(json_build_object(
            'name', ac.full_name,
            'title', ac.title,
            'linkedin_url', ac.linkedin_url,
            'mes_relevance_score', ac.mes_relevance_score,
            'tier', ac.tier)
          ORDER BY ac.display_order)
     FROM public.agency_contacts_public ac
    WHERE ac.agency_id = tia.id AND ac.is_primary = true AND ac.is_archived = false
  ) AS primary_contacts,
  (SELECT json_agg(json_build_object(
            'name', ac.full_name,
            'title', ac.title,
            'linkedin_url', ac.linkedin_url,
            'tier', ac.tier)
          ORDER BY ac.display_order)
     FROM public.agency_contacts_public ac
    WHERE ac.agency_id = tia.id AND ac.is_primary = false AND ac.is_archived = false
  ) AS team_contacts,
  (SELECT json_agg(json_build_object(
            'title', ar.title,
            'type', ar.resource_type,
            'value', ar.max_value_aud,
            'url', ar.url))
     FROM public.agency_resources ar
    WHERE ar.agency_id = tia.id AND ar.is_active = true
  ) AS resources
FROM public.trade_investment_agencies tia
LEFT JOIN public.organisation_categories oc ON oc.slug = tia.category_slug
WHERE tia.is_active = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. investors: admin-only base
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can read investors" ON public.investors;
CREATE POLICY "Admins can view investors"
  ON public.investors FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'::public.app_role));

-- Table-level grants (authenticated held full SELECT — the S2 leak).
REVOKE SELECT ON TABLE public.investors FROM anon;
REVOKE SELECT ON TABLE public.investors FROM authenticated;
-- Column-level grants from SEC-07 must be revoked explicitly (revoking the
-- table privilege does not touch per-column ACL entries).
REVOKE SELECT (
  id, slug, name, description, investor_type, location, website, logo,
  sector_focus, stage_focus, check_size_min, check_size_max, basic_info,
  why_work_with_us, is_featured, created_at, updated_at, currently_investing,
  leads_deals, country, application_url, fund_size, year_fund_closed,
  portfolio_companies, meta_title, meta_description
) ON public.investors FROM anon;
-- Same as agency_contacts: admins keep client-side read via RLS, not USING(true).
GRANT SELECT ON TABLE public.investors TO authenticated;

-- investors_public already exposes only the PII-safe columns; flip it to
-- SECURITY DEFINER so it keeps working now that the base is admin-locked.
ALTER VIEW public.investors_public SET (security_invoker = 'false');
ALTER VIEW public.investors_public OWNER TO postgres;
GRANT SELECT ON public.investors_public TO anon;
GRANT SELECT ON public.investors_public TO authenticated;
GRANT SELECT ON public.investors_public TO service_role;

-- Post-apply verification (human, per ticket acceptance criteria):
--   * as anon and as a plain authenticated user:
--       select contact_email from investors        -> permission denied / 0 rows
--       select email from agency_contacts          -> permission denied / 0 rows
--       select * from investors_public             -> rows, no PII columns
--       select * from agency_contacts_public       -> rows, no email/phone
--       select primary_contacts from agencies_report_view -> JSON without email
--   * /investors and /government-support/:slug pages still render
--   * get_advisors security run shows no NEW exposure findings
