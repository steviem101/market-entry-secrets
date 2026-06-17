-- Mentors remediation WS-A3 + WS-A4: close the anonymity bypass.
-- The masked, owner-executed community_members_public view is now the only
-- anon-facing path, so anon must lose direct base-table read. anon's grant is
-- column-level, so revoke at the column level too (REVOKE SELECT ON <table>
-- alone does not clear column grants). Idempotent.
-- (Applied to prod 2026-06-16 as 20260616_mentor_base_lockdown_and_contact_requests_rls.)

-- WS-A3: lock anon out of community_members.
REVOKE SELECT ON public.community_members FROM anon;
REVOKE SELECT (
  id, name, title, description, location, experience, specialties, image, company,
  is_anonymous, experience_tiles, created_at, updated_at, origin_country,
  associated_countries, location_id, slug, archetype, persona_fit, is_active, is_featured
) ON public.community_members FROM anon;

DROP POLICY IF EXISTS "Everyone can view community members" ON public.community_members;
DROP POLICY IF EXISTS "Admins can view community members" ON public.community_members;
CREATE POLICY "Admins can view community members"
  ON public.community_members FOR SELECT TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- WS-A4: harden mentor_contact_requests. Keep the public INSERT funnel; scope
-- admin SELECT/UPDATE to authenticated and drop the unnecessary anon SELECT grant.
DROP POLICY IF EXISTS "admins can view all mentor contact requests" ON public.mentor_contact_requests;
CREATE POLICY "admins can view all mentor contact requests"
  ON public.mentor_contact_requests FOR SELECT TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "admins can update mentor contact requests" ON public.mentor_contact_requests;
CREATE POLICY "admins can update mentor contact requests"
  ON public.mentor_contact_requests FOR UPDATE TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

REVOKE SELECT ON public.mentor_contact_requests FROM anon;
