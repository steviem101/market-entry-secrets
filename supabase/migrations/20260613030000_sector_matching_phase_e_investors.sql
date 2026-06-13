-- =====================================================================
-- Sector-relevance matching — Phase E: investors
--
-- The investors table carries a messy free-text sector_focus[] (602 distinct
-- values: "SaaS", "FinTech", "Consumer", "Generalist", "PropTech", …). This
-- phase gives investors the same canonical sector_tags[] + sector_agnostic
-- treatment as the other 7 directory tables so the matcher can rank them by
-- sector relevance instead of returning the first 8 rows.
--
-- Two parts:
--   1. Extend map_sector_value()'s fuzzy fallback to cover the investor-vertical
--      head that wasn't mapped (Consumer, Marketplace, DevTools, Blockchain,
--      Hardware, Climate, Mobility, Compliance, …). Additive only — every
--      existing keyword is preserved, so re-running other backfills stays safe.
--   2. Add agnostic vocab for "Generalist" / "All Sectors", add the columns to
--      investors, and backfill from sector_focus[].
--
-- Additive + idempotent.
-- =====================================================================

-- ── 1. Agnostic vocab for explicit generalist investors ────────────────────
INSERT INTO public.sector_vocabulary (raw_value, sector_slugs, is_agnostic) VALUES
  ('generalist',  '{}', true),
  ('all sectors', '{}', true),
  ('sector-agnostic', '{}', true)
ON CONFLICT (raw_value) DO UPDATE
  SET sector_slugs = EXCLUDED.sector_slugs, is_agnostic = EXCLUDED.is_agnostic;

-- ── 2. Extend the fuzzy fallback (only NEW keywords added per line) ─────────
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

  -- Fuzzy keyword fallback for free-text values not in the vocab.
  IF r ~ 'health|medic|clinical|pharma|biotech|life scien|wellness|aged care|disabilit' THEN out := array_append(out, 'hospitals-and-health-care'); END IF;
  IF r ~ 'fintech|financ|bank|insur|capital|payment|wealth|trading|invest|crypto' THEN out := array_append(out, 'financial-services'); END IF;
  IF r ~ 'tech|software|saas|digital|data|\mai\M|cyber|cloud|iot|web3|platform|media|information|internet|telecom|comput|marketplace|devtool|developer tool|open source|\mmobile\M|future of work|\mml\M|blockchain|crypto|telco' THEN out := array_append(out, 'technology-information-and-media'); END IF;
  IF r ~ 'manufactur|industrial|engineer|machinery|electronics|chemical|hardware|robotic' THEN out := array_append(out, 'manufacturing'); END IF;
  IF r ~ 'construct|infrastructure|built environ|building|urban|smart cit' THEN out := array_append(out, 'construction'); END IF;
  IF r ~ 'logist|supply chain|transport|freight|maritime|aviation|shipping|mobilit' THEN out := array_append(out, 'transportation-logistics-supply-chain-and-storage'); END IF;
  IF r ~ 'energy|utilit|water|power|grid|renewable|cleantech|solar|wind|climate|sustainab|circular econom' THEN out := array_append(out, 'utilities'); END IF;
  IF r ~ 'min(e|ing)|resource|oil|gas|petroleum|metals' THEN out := array_append(out, 'oil-gas-and-mining'); END IF;
  IF r ~ 'agri|farm|food|beverage|aquacultur|forestr' THEN out := array_append(out, 'farming-ranching-forestry'); END IF;
  IF r ~ 'defen[cs]e|military|maritime|government|public sector|gov tech|govtech|urban develop|smart cit' THEN out := array_append(out, 'government-administration'); END IF;
  IF r ~ 'educat|edtech|training|learning|university' THEN out := array_append(out, 'education'); END IF;
  IF r ~ 'retail|e-?commerce|consumer goods|fashion|apparel|\mconsumer\M|\mdtc\M|direct.to.consumer' THEN out := array_append(out, 'retail'); END IF;
  IF r ~ 'real estate|property|proptech' THEN out := array_append(out, 'real-estate-and-equipment-rental-services'); END IF;
  IF r ~ 'tourism|hospitality|accommodation|hotel|restaurant' THEN out := array_append(out, 'accommodation-and-food-services'); END IF;
  IF r ~ 'legal|account|consult|advisory|design|architect|research|professional|governance|complian' THEN out := array_append(out, 'professional-services'); END IF;
  IF r ~ 'creative|media production|entertainment|arts|sport|gaming' THEN out := array_append(out, 'entertainment-providers'); END IF;
  IF r ~ 'staffing|recruit|\mhr\M|facilities|administ|outsourc|safety|workplace' THEN out := array_append(out, 'administrative-and-support-services'); END IF;
  IF r ~ 'wholesale|distribution' THEN out := array_append(out, 'wholesale'); END IF;

  RETURN (SELECT COALESCE(array_agg(DISTINCT s), '{}') FROM unnest(out) s);
END $$;

-- ── 3. Add canonical columns to investors + GIN index ──────────────────────
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS sector_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sector_agnostic boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_inv_sector_gin ON public.investors USING gin (sector_tags);

-- ── 4. Backfill investors from sector_focus[] ──────────────────────────────
-- Agnostic when: an explicit "Generalist"/"All Sectors" tag, OR no focus stated,
-- OR a focus is stated but none of it maps to a sector (pure thesis investors
-- like "Impact"/"Female Founders") — they stay eligible for every sector.
UPDATE public.investors
SET sector_tags     = public.map_sector_values(sector_focus),
    sector_agnostic = public.any_sector_agnostic(sector_focus)
                      OR COALESCE(array_length(sector_focus, 1), 0) = 0
                      OR public.map_sector_values(sector_focus) = '{}';
