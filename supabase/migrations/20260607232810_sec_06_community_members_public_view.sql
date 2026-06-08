-- Workstream A3: community_members.contact (and website) publicly readable. Create a public view
-- exposing only safe columns. Column grants on the base table are applied in
-- 20260607232915_sec_07_column_grants_anon.sql.
--
-- Workstream C1: community_members UPDATE policy was USING (true) -- any authenticated user
-- could edit any profile. No user_id FK on this table, so true ownership isn't possible.
-- Lock writes to admin-only.
--
-- Defensive: build the view from columns that actually exist on public.community_members
-- so the migration works against both production and preview schemas.

DO $$
DECLARE
  cols text;
BEGIN
  IF to_regclass('public.community_members') IS NULL THEN
    RAISE NOTICE 'Skipping community_members_public — public.community_members not present';
    RETURN;
  END IF;

  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'community_members'
    AND column_name = ANY (ARRAY[
      'id','name','title','description','location','experience',
      'specialties','image','company','is_anonymous',
      'experience_tiles','created_at','updated_at',
      'origin_country','associated_countries','location_id',
      'slug','archetype','persona_fit','is_active','is_featured'
    ]);

  IF cols IS NULL THEN
    RAISE NOTICE 'Skipping community_members_public — no safe columns present';
    RETURN;
  END IF;

  EXECUTE format(
    'CREATE OR REPLACE VIEW public.community_members_public WITH (security_invoker = true) AS SELECT %s FROM public.community_members',
    cols
  );
  EXECUTE 'GRANT SELECT ON public.community_members_public TO anon, authenticated';
END $$;

-- Write policies — admin-only. Skip if the table or has_role function is missing.
DO $$ BEGIN
  IF to_regclass('public.community_members') IS NOT NULL
     AND to_regprocedure('public.has_role(uuid, public.app_role)') IS NOT NULL THEN

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
  END IF;
END $$;
