-- Workstream A3: community_members.contact (and website) publicly readable. Create a public view
-- exposing only safe columns. Column grants on the base table are applied in
-- 20260607232915_sec_07_column_grants_anon.sql.
--
-- Workstream C1: community_members UPDATE policy was USING (true) -- any authenticated user
-- could edit any profile. No user_id FK on this table, so true ownership isn't possible.
-- Lock writes to admin-only.

CREATE OR REPLACE VIEW public.community_members_public
  WITH (security_invoker = true) AS
  SELECT
    id, name, title, description, location, experience,
    specialties, image, company, is_anonymous,
    experience_tiles, created_at, updated_at,
    origin_country, associated_countries, location_id,
    slug, archetype, persona_fit, is_active, is_featured
  FROM public.community_members;

GRANT SELECT ON public.community_members_public TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can update community members" ON public.community_members;
DROP POLICY IF EXISTS "Authenticated users can create their own profiles" ON public.community_members;

CREATE POLICY "Admins can insert community members" ON public.community_members
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update community members" ON public.community_members
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete community members" ON public.community_members
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
