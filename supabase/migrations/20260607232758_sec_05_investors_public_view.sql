-- Workstream A2: investors.contact_email + contact_name + linkedin_url are publicly readable.
-- Create a public view exposing only safe columns. Column grants on the base table are applied
-- in 20260607232915_sec_07_column_grants_anon.sql.
--
-- Defensive: the view is built dynamically from columns that actually exist on
-- public.investors so the migration works against both the production schema and any
-- preview branch with a different column set.

DO $$
DECLARE
  cols text;
BEGIN
  IF to_regclass('public.investors') IS NULL THEN
    RAISE NOTICE 'Skipping investors_public — public.investors not present';
    RETURN;
  END IF;

  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'investors'
    AND column_name = ANY (ARRAY[
      'id','slug','name','description','investor_type','location',
      'website','logo','sector_focus','stage_focus',
      'check_size_min','check_size_max','basic_info','why_work_with_us',
      'is_featured','created_at','updated_at','currently_investing',
      'leads_deals','country','application_url','fund_size','year_fund_closed',
      'portfolio_companies','meta_title','meta_description'
    ]);

  IF cols IS NULL THEN
    RAISE NOTICE 'Skipping investors_public — no safe columns present';
    RETURN;
  END IF;

  EXECUTE format(
    'CREATE OR REPLACE VIEW public.investors_public WITH (security_invoker = true) AS SELECT %s FROM public.investors',
    cols
  );
  EXECUTE 'GRANT SELECT ON public.investors_public TO anon, authenticated';
END $$;
