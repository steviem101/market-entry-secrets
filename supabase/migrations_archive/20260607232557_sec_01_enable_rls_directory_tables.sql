-- Workstream C4: Enable RLS on public directory tables with public SELECT preserved.
-- These tables are read by mes-context (Content Studio) via anon, so policies must keep that working.
--
-- Defensive: each block guarded by to_regclass(...) so the migration is idempotent
-- against partial schema state (Supabase preview branches built from incomplete history).

DO $$ BEGIN
  IF to_regclass('public.service_providers') IS NOT NULL THEN
    ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view service providers" ON public.service_providers;
    CREATE POLICY "Public can view service providers" ON public.service_providers FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.innovation_ecosystem') IS NOT NULL THEN
    ALTER TABLE public.innovation_ecosystem ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view innovation ecosystem" ON public.innovation_ecosystem;
    CREATE POLICY "Public can view innovation ecosystem" ON public.innovation_ecosystem FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.trade_investment_agencies') IS NOT NULL THEN
    ALTER TABLE public.trade_investment_agencies ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view trade investment agencies" ON public.trade_investment_agencies;
    CREATE POLICY "Public can view trade investment agencies" ON public.trade_investment_agencies FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.countries') IS NOT NULL THEN
    ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
    CREATE POLICY "Public can view countries" ON public.countries FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.locations') IS NOT NULL THEN
    ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view locations" ON public.locations;
    CREATE POLICY "Public can view locations" ON public.locations FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.industry_sectors') IS NOT NULL THEN
    ALTER TABLE public.industry_sectors ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can view industry sectors" ON public.industry_sectors;
    CREATE POLICY "Public can view industry sectors" ON public.industry_sectors FOR SELECT USING (true);
  END IF;
END $$;

-- Staging + ii_* tables: admin-only (writes only via service role; no public reads).
-- No policies = no access except service role (bypasses RLS).

DO $$ BEGIN IF to_regclass('public.trade_agencies_enrichment_staging') IS NOT NULL THEN
  ALTER TABLE public.trade_agencies_enrichment_staging ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_reddit_signals') IS NOT NULL THEN
  ALTER TABLE public.ii_reddit_signals ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_prefilter_log') IS NOT NULL THEN
  ALTER TABLE public.ii_prefilter_log ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_curated_log') IS NOT NULL THEN
  ALTER TABLE public.ii_curated_log ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_intro_archive') IS NOT NULL THEN
  ALTER TABLE public.ii_intro_archive ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_curations') IS NOT NULL THEN
  ALTER TABLE public.ii_curations ENABLE ROW LEVEL SECURITY;
END IF; END $$;
DO $$ BEGIN IF to_regclass('public.ii_experiment_outputs') IS NOT NULL THEN
  ALTER TABLE public.ii_experiment_outputs ENABLE ROW LEVEL SECURITY;
END IF; END $$;
