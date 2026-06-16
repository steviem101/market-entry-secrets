-- Revert Mentors remediation WS-A2: restore the pre-remediation pass-through
-- community_members_public view (no masking) with security_invoker = true,
-- exactly as captured before the change.
-- WARNING: this re-exposes anonymous members' real identity through the view.
-- Only meaningful in combination with the WS-A3 revert (which re-opens base read).
CREATE OR REPLACE VIEW public.community_members_public AS
SELECT
  id, name, title, description, location, experience, specialties, image, company,
  is_anonymous, experience_tiles, created_at, updated_at, origin_country,
  associated_countries, location_id, slug, archetype, persona_fit, is_active, is_featured
FROM public.community_members;

ALTER VIEW public.community_members_public SET (security_invoker = true);
