-- Refines A2/A3: use column-level grants so mes-context (Content Studio anon) can still read
-- safe columns from the base tables. Queries that select PII columns or `select=*` will 403.
--
-- Defensive: grants are built from columns that actually exist so the migration adapts to
-- both production and preview schemas.

-- ── community_members ──────────────────────────────────────────────────────
DO $$
DECLARE
  cols text;
BEGIN
  IF to_regclass('public.community_members') IS NULL THEN RETURN; END IF;

  DROP POLICY IF EXISTS "Authenticated can read community members" ON public.community_members;
  DROP POLICY IF EXISTS "Everyone can view community members" ON public.community_members;
  EXECUTE 'CREATE POLICY "Everyone can view community members" ON public.community_members FOR SELECT USING (true)';

  REVOKE SELECT ON public.community_members FROM anon;

  SELECT string_agg(quote_ident(column_name), ', ')
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'community_members'
    AND column_name = ANY (ARRAY[
      'id','name','title','description','location','experience','specialties',
      'image','company','is_anonymous','experience_tiles','created_at','updated_at',
      'origin_country','associated_countries','location_id','slug','archetype',
      'persona_fit','is_active','is_featured'
    ]);
  -- Excluded by design: contact, website (PII)

  IF cols IS NOT NULL THEN
    EXECUTE format('GRANT SELECT (%s) ON public.community_members TO anon', cols);
  END IF;
END $$;

-- ── investors ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  cols text;
BEGIN
  IF to_regclass('public.investors') IS NULL THEN RETURN; END IF;

  DROP POLICY IF EXISTS "Authenticated can read investors" ON public.investors;
  DROP POLICY IF EXISTS "Anyone can read investors" ON public.investors;
  EXECUTE 'CREATE POLICY "Anyone can read investors" ON public.investors FOR SELECT USING (true)';

  REVOKE SELECT ON public.investors FROM anon;

  SELECT string_agg(quote_ident(column_name), ', ')
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'investors'
    AND column_name = ANY (ARRAY[
      'id','slug','name','description','investor_type','location',
      'website','logo','sector_focus','stage_focus','check_size_min','check_size_max',
      'basic_info','why_work_with_us','is_featured','created_at','updated_at',
      'currently_investing','leads_deals','country','application_url','fund_size',
      'year_fund_closed','portfolio_companies','meta_title','meta_description'
    ]);
  -- Excluded by design: contact_email, contact_name, linkedin_url, details (PII)

  IF cols IS NOT NULL THEN
    EXECUTE format('GRANT SELECT (%s) ON public.investors TO anon', cols);
  END IF;
END $$;
