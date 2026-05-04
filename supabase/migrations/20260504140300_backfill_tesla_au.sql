-- Phase 5.3 Batch 2 (4/9): Tesla AU market entry backfill
-- Quotes intentionally skipped — research surfaced no first-person attributable
-- statements from Tesla AU executives. TLDR / quick_facts / sources still applied.

DO $$
DECLARE
  v_case_study_id uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'tesla-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'tesla-australia-market-entry not found'; END IF;

  UPDATE public.content_items SET
    tldr = ARRAY['Model S launched in Sydney on December 9, 2014','Hornsdale Power Reserve delivered in 100 days, 2017','Heath Walker led AU marketing; Sam McLean ran policy','Supercharger network surpassed 100 AU sites by September 2024','Model Y topped AU private sales in 2023 with 28,769 units'],
    quick_facts = '[{"label":"AU Entry Year","value":"2014 (Sydney launch Dec 9)","icon":"Calendar"},{"label":"AU Marketing Lead","value":"Heath Walker","icon":"User"},{"label":"AU Policy & BizDev Lead","value":"Sam McLean","icon":"Users"},{"label":"Supercharger AU Sites","value":"100+ (Sep 2024)","icon":"Zap"},{"label":"Hornsdale Capacity","value":"150 MW / 193.5 MWh","icon":"Battery"},{"label":"Origin","value":"Palo Alto / Austin, USA","icon":"Globe2"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'InsideEVs — Tesla Model S launches in Australia', 'https://insideevs.com/news/324516/tesla-model-s-launches-in-australia-first-australian-supercharger-comes-online/', '2026-05-04', 'news', 1),
    (v_case_study_id, 'RenewEconomy — Tesla to launch in Australia in early December', 'https://reneweconomy.com.au/tesla-to-launch-in-australia-in-early-december-34518/', '2026-05-04', 'news', 2),
    (v_case_study_id, 'Wikipedia — Hornsdale Power Reserve', 'https://en.wikipedia.org/wiki/Hornsdale_Power_Reserve', '2026-05-04', 'other', 3),
    (v_case_study_id, 'Hornsdale Power Reserve official site', 'https://hornsdalepowerreserve.com.au/', '2026-05-04', 'other', 4),
    (v_case_study_id, 'Energy Storage News — Undeniable success: SA''s Tesla battery', 'https://www.energy-storage.news/undeniable-success-south-australias-129mwh-tesla-battery/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'CarExpert — VFACTS 2023: Tesla Model Y was Australia''s best-selling car with private buyers', 'https://www.carexpert.com.au/car-news/vfacts-2023-tesla-model-y-was-australias-best-selling-new-car-with-private-buyers', '2026-05-04', 'news', 6),
    (v_case_study_id, 'RenewEconomy — Transgrid to build first Tesla Megapack big battery in Western Sydney', 'https://reneweconomy.com.au/transgrid-to-build-australias-first-tesla-megapack-big-battery-in-western-sydney-55391/', '2026-05-04', 'news', 7),
    (v_case_study_id, 'RenewEconomy — Genex picks Tesla Megapacks for 100MWh standalone battery in Queensland', 'https://reneweconomy.com.au/genex-picks-tesla-megapacks-for-100mwh-standalone-battery-in-queensland/', '2026-05-04', 'news', 8),
    (v_case_study_id, 'The Driven — Tesla to add 30 new Supercharger sites around Australia', 'https://thedriven.io/2024/09/15/tesla-to-add-30-new-supercharger-sites-around-australia-in-big-boost-to-ev-network/', '2026-05-04', 'news', 9),
    (v_case_study_id, 'Electric Vehicle Council — Sam McLean profile', 'https://electricvehiclecouncil.com.au/portfolio/sam-mclean/', '2026-05-04', 'other', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
END $$;
