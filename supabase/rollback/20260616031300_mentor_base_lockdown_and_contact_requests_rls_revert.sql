-- Revert Mentors remediation WS-A3 + WS-A4: restore pre-remediation access.
-- Re-grants anon column-level SELECT on community_members and restores the
-- public read-through policy; restores the public-role mentor_contact_requests
-- policies and anon SELECT grant.
-- WARNING: this re-opens the anonymity bypass (anon can read the base table
-- directly). Pair with the WS-A2 revert if fully rolling back.
GRANT SELECT (
  id, name, title, description, location, experience, specialties, image, company,
  is_anonymous, experience_tiles, created_at, updated_at, origin_country,
  associated_countries, location_id, slug, archetype, persona_fit, is_active, is_featured
) ON public.community_members TO anon;

DROP POLICY IF EXISTS "Admins can view community members" ON public.community_members;
DROP POLICY IF EXISTS "Everyone can view community members" ON public.community_members;
CREATE POLICY "Everyone can view community members"
  ON public.community_members FOR SELECT TO public
  USING (true);

GRANT SELECT ON public.mentor_contact_requests TO anon;

DROP POLICY IF EXISTS "admins can view all mentor contact requests" ON public.mentor_contact_requests;
CREATE POLICY "admins can view all mentor contact requests"
  ON public.mentor_contact_requests FOR SELECT TO public
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "admins can update mentor contact requests" ON public.mentor_contact_requests;
CREATE POLICY "admins can update mentor contact requests"
  ON public.mentor_contact_requests FOR UPDATE TO public
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));
