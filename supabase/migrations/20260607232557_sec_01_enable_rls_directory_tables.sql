-- Workstream C4: Enable RLS on public directory tables with public SELECT preserved.
-- These tables are read by mes-context (Content Studio) via anon, so policies must keep that working.

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view service providers" ON public.service_providers;
CREATE POLICY "Public can view service providers" ON public.service_providers FOR SELECT USING (true);

ALTER TABLE public.innovation_ecosystem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view innovation ecosystem" ON public.innovation_ecosystem;
CREATE POLICY "Public can view innovation ecosystem" ON public.innovation_ecosystem FOR SELECT USING (true);

ALTER TABLE public.trade_investment_agencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view trade investment agencies" ON public.trade_investment_agencies;
CREATE POLICY "Public can view trade investment agencies" ON public.trade_investment_agencies FOR SELECT USING (true);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
CREATE POLICY "Public can view countries" ON public.countries FOR SELECT USING (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view locations" ON public.locations;
CREATE POLICY "Public can view locations" ON public.locations FOR SELECT USING (true);

ALTER TABLE public.industry_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view industry sectors" ON public.industry_sectors;
CREATE POLICY "Public can view industry sectors" ON public.industry_sectors FOR SELECT USING (true);

ALTER TABLE public.trade_agencies_enrichment_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_reddit_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_prefilter_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_curated_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_intro_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_curations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_experiment_outputs ENABLE ROW LEVEL SECURITY;
