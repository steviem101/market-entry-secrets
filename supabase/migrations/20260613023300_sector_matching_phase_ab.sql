-- =====================================================================
-- Sector-relevance matching — Phase A (schema) + Phase B (SQL backfill)
--
-- Canonical key: the 20 LinkedIn PARENT SECTORS (slugs). The intake form
-- collects LinkedIn industry GROUPS (152); the edge matcher rolls those up to
-- the 20 parent sectors (sectorTaxonomy.ts, mirrors src/constants/linkedinTaxonomy.ts).
-- Directory rows are tagged with the same 20-sector slugs in `sector_tags[]`.
--
-- "Sector Agnostic" rows (84% of trade agencies, 35% of hubs) are modelled as
-- sector_tags = '{}' + sector_agnostic = true → eligible for everyone but
-- ranked below a sector-specific match by the matcher.
--
-- Additive + idempotent. Existing messy columns (services[], sectors[],
-- sector_focus[], sector text, …) are left untouched.
-- =====================================================================

-- ── 1. Vocabulary map (directory raw value → 20-sector slugs) ──────────────
CREATE TABLE IF NOT EXISTS public.sector_vocabulary (
  raw_value text PRIMARY KEY,            -- lower-cased, trimmed
  sector_slugs text[] NOT NULL DEFAULT '{}'::text[],
  is_agnostic boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sector_vocabulary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read sector vocabulary" ON public.sector_vocabulary;
CREATE POLICY "Anyone can read sector vocabulary"
  ON public.sector_vocabulary FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage sector vocabulary" ON public.sector_vocabulary;
CREATE POLICY "Admins manage sector vocabulary"
  ON public.sector_vocabulary FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed: thematic verticals + LinkedIn sector/group names + leads industries.
-- Multi-sector verticals map to 2-3 parent sectors (recall over precision).
INSERT INTO public.sector_vocabulary (raw_value, sector_slugs, is_agnostic) VALUES
  -- universal
  ('sector agnostic', '{}', true),
  ('all', '{}', true),
  ('agnostic', '{}', true),
  -- thematic startup verticals
  ('cleantech',        ARRAY['utilities','manufacturing','professional-services'], false),
  ('healthtech',       ARRAY['hospitals-and-health-care','technology-information-and-media'], false),
  ('deep tech',        ARRAY['technology-information-and-media','professional-services','manufacturing'], false),
  ('deeptech',         ARRAY['technology-information-and-media','professional-services','manufacturing'], false),
  ('ai',               ARRAY['technology-information-and-media'], false),
  ('agritech',         ARRAY['farming-ranching-forestry','technology-information-and-media'], false),
  ('space',            ARRAY['government-administration','technology-information-and-media','manufacturing'], false),
  ('fintech',          ARRAY['financial-services','technology-information-and-media'], false),
  ('foodtech',         ARRAY['manufacturing','accommodation-and-food-services','technology-information-and-media'], false),
  ('edtech',           ARRAY['education','technology-information-and-media'], false),
  ('defence',          ARRAY['government-administration','manufacturing'], false),
  ('defense',          ARRAY['government-administration','manufacturing'], false),
  ('cybersecurity',    ARRAY['technology-information-and-media'], false),
  ('smart cities',     ARRAY['government-administration','technology-information-and-media','construction'], false),
  ('iot',              ARRAY['technology-information-and-media','manufacturing'], false),
  ('insurtech',        ARRAY['financial-services','technology-information-and-media'], false),
  ('property',         ARRAY['real-estate-and-equipment-rental-services'], false),
  ('regtech',          ARRAY['financial-services','technology-information-and-media','professional-services'], false),
  ('web3',             ARRAY['technology-information-and-media','financial-services'], false),
  ('creative industries', ARRAY['entertainment-providers','professional-services'], false),
  ('tourism',          ARRAY['accommodation-and-food-services','consumer-services'], false),
  ('resources',        ARRAY['oil-gas-and-mining','utilities'], false),
  ('energy',           ARRAY['utilities','oil-gas-and-mining'], false),
  ('transport',        ARRAY['transportation-logistics-supply-chain-and-storage'], false),
  -- direct LinkedIn sector / group names that appear in the data
  ('manufacturing',        ARRAY['manufacturing'], false),
  ('financial services',   ARRAY['financial-services'], false),
  ('mining',               ARRAY['oil-gas-and-mining'], false),
  ('construction',         ARRAY['construction'], false),
  ('technology',           ARRAY['technology-information-and-media'], false),
  ('professional_services',ARRAY['professional-services'], false),
  ('professional services',ARRAY['professional-services'], false),
  -- leads.industry values
  ('healthcare technology',ARRAY['hospitals-and-health-care','technology-information-and-media'], false),
  ('financial technology', ARRAY['financial-services','technology-information-and-media'], false),
  ('retail & e-commerce',  ARRAY['retail'], false)
ON CONFLICT (raw_value) DO UPDATE
  SET sector_slugs = EXCLUDED.sector_slugs, is_agnostic = EXCLUDED.is_agnostic;

-- ── 2. Normaliser: raw value → sector slugs (exact map, then fuzzy fallback) ─
CREATE OR REPLACE FUNCTION public.map_sector_value(raw text)
RETURNS text[] LANGUAGE plpgsql STABLE AS $$
DECLARE
  r text := lower(trim(coalesce(raw, '')));
  hit text[];
  out text[] := '{}';
BEGIN
  IF r = '' THEN RETURN '{}'; END IF;

  SELECT sector_slugs INTO hit FROM public.sector_vocabulary WHERE raw_value = r;
  IF hit IS NOT NULL THEN RETURN hit; END IF;

  -- Fuzzy keyword fallback for free-text values not in the vocab (e.g. events.sector).
  IF r ~ 'health|medic|clinical|pharma|biotech|life scien|wellness|aged care|disabilit' THEN out := array_append(out, 'hospitals-and-health-care'); END IF;
  IF r ~ 'fintech|financ|bank|insur|capital|payment|wealth|trading|invest' THEN out := array_append(out, 'financial-services'); END IF;
  IF r ~ 'tech|software|saas|digital|data|\mai\M|cyber|cloud|iot|web3|platform|media|information|internet|telecom|comput' THEN out := array_append(out, 'technology-information-and-media'); END IF;
  IF r ~ 'manufactur|industrial|engineer|machinery|electronics|chemical' THEN out := array_append(out, 'manufacturing'); END IF;
  IF r ~ 'construct|infrastructure|built environ|building|urban|smart cit' THEN out := array_append(out, 'construction'); END IF;
  IF r ~ 'logist|supply chain|transport|freight|maritime|aviation|shipping' THEN out := array_append(out, 'transportation-logistics-supply-chain-and-storage'); END IF;
  IF r ~ 'energy|utilit|water|power|grid|renewable|cleantech|solar|wind' THEN out := array_append(out, 'utilities'); END IF;
  IF r ~ 'min(e|ing)|resource|oil|gas|petroleum|metals' THEN out := array_append(out, 'oil-gas-and-mining'); END IF;
  IF r ~ 'agri|farm|food|beverage|aquacultur|forestr' THEN out := array_append(out, 'farming-ranching-forestry'); END IF;
  IF r ~ 'defen[cs]e|military|maritime|government|public sector|gov tech|govtech|urban develop|smart cit' THEN out := array_append(out, 'government-administration'); END IF;
  IF r ~ 'educat|edtech|training|learning|university' THEN out := array_append(out, 'education'); END IF;
  IF r ~ 'retail|e-?commerce|consumer goods|fashion|apparel' THEN out := array_append(out, 'retail'); END IF;
  IF r ~ 'real estate|property|proptech' THEN out := array_append(out, 'real-estate-and-equipment-rental-services'); END IF;
  IF r ~ 'tourism|hospitality|accommodation|hotel|restaurant' THEN out := array_append(out, 'accommodation-and-food-services'); END IF;
  IF r ~ 'legal|account|consult|advisory|design|architect|research|professional|governance' THEN out := array_append(out, 'professional-services'); END IF;
  IF r ~ 'creative|media production|entertainment|arts|sport|gaming' THEN out := array_append(out, 'entertainment-providers'); END IF;
  IF r ~ 'staffing|recruit|\mhr\M|facilities|administ|outsourc|safety|workplace' THEN out := array_append(out, 'administrative-and-support-services'); END IF;
  IF r ~ 'wholesale|distribution' THEN out := array_append(out, 'wholesale'); END IF;

  RETURN (SELECT COALESCE(array_agg(DISTINCT s), '{}') FROM unnest(out) s);
END $$;

-- Aggregate a text[] of raw values into deduped sector slugs.
CREATE OR REPLACE FUNCTION public.map_sector_values(raws text[])
RETURNS text[] LANGUAGE sql STABLE AS $$
  SELECT COALESCE(array_agg(DISTINCT slug), '{}')
  FROM unnest(coalesce(raws, '{}'::text[])) AS r
  CROSS JOIN LATERAL unnest(public.map_sector_value(r)) AS slug;
$$;

-- Is any raw value in the array flagged agnostic?
CREATE OR REPLACE FUNCTION public.any_sector_agnostic(raws text[])
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM unnest(coalesce(raws, '{}'::text[])) AS r
    JOIN public.sector_vocabulary sv ON sv.raw_value = lower(trim(r))
    WHERE sv.is_agnostic
  );
$$;

-- ── 3. Add canonical columns to every report-surfaced directory table ──────
ALTER TABLE public.service_providers          ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.community_members          ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.events                     ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.content_items              ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.leads                      ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.innovation_ecosystem       ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;
ALTER TABLE public.trade_investment_agencies  ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[], ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_sp_sector_gin   ON public.service_providers          USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_cm_sector_gin   ON public.community_members          USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_ev_sector_gin   ON public.events                     USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_ci_sector_gin   ON public.content_items              USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_ld_sector_gin   ON public.leads                      USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_ie_sector_gin   ON public.innovation_ecosystem       USING gin (sector_tags);
CREATE INDEX IF NOT EXISTS idx_ta_sector_gin   ON public.trade_investment_agencies  USING gin (sector_tags);

-- ── 4. Phase B backfill: tables with an existing sector/vertical column ────
-- innovation_ecosystem.sectors[] → sector_tags
UPDATE public.innovation_ecosystem
SET sector_tags = public.map_sector_values(sectors),
    sector_agnostic = public.any_sector_agnostic(sectors)
WHERE sectors IS NOT NULL;

-- trade_investment_agencies.sectors_supported[] → sector_tags
UPDATE public.trade_investment_agencies
SET sector_tags = public.map_sector_values(sectors_supported),
    sector_agnostic = public.any_sector_agnostic(sectors_supported)
WHERE sectors_supported IS NOT NULL;

-- events.sector (text) → sector_tags (exact map then fuzzy)
UPDATE public.events
SET sector_tags = public.map_sector_value(sector),
    sector_agnostic = (sector ~* 'startup|scaleup|scale-up|small business|entrepreneur')
WHERE sector IS NOT NULL AND length(sector) > 0;

-- leads.industry (text) → sector_tags
UPDATE public.leads
SET sector_tags = public.map_sector_value(industry)
WHERE industry IS NOT NULL AND length(industry) > 0;

-- service_providers, community_members, content_items are tagged by AI in Phase C.
