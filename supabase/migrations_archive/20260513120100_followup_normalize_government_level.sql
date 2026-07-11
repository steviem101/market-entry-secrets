-- Follow-up 2: standardise government_level for foreign agencies vs bilateral chambers.
--
-- The Phase 3 research sub-agents produced inconsistent classifications
-- (KOTRA → 'bilateral', Enterprise Ireland → 'international') for what are
-- structurally the same kind of entity: foreign federal trade agencies
-- running an Australian/NZ office.
--
-- New convention:
--   * 'international'  → foreign federal trade agencies (KOTRA, JETRO,
--                        Enterprise Ireland, Business France, etc.) and
--                        foreign consulates/embassies. Identified by
--                        organisation_type = 'foreign_trade_agency'.
--   * 'bilateral'      → member-funded bilateral business councils /
--                        chambers of commerce with no formal government
--                        affiliation (FACCI, AKBC, AmCham, EABC, the
--                        country-pair business councils). Identified by
--                        organisation_type = 'bilateral'.
--   * 'federal'        → domestic AU/NZ federal agencies (Austrade,
--                        Export Finance Australia, NZTE, Callaghan
--                        Innovation). Unchanged.
--   * 'state'          → AU state government bodies. Unchanged.
--   * 'industry'       → industry peak bodies (FinTech Australia, ECA,
--                        AiGroup, CCIWA). Unchanged.
--   * 'local'          → local/regional chambers (Swan). Unchanged.
--   * 'none'           → private trade consultancies (ALTIOS, Expandys,
--                        Export Connect). Unchanged.

-- Rule 1: all foreign trade agencies → 'international'
UPDATE trade_investment_agencies
SET government_level = 'international',
    last_updated_at = now(),
    updated_at = now()
WHERE organisation_type = 'foreign_trade_agency'
  AND COALESCE(government_level, '') <> 'international';

-- Rule 2: all bilateral business councils / chambers → 'bilateral'
-- Excludes rows correctly tagged industry/local (CCIWA, Swan).
UPDATE trade_investment_agencies
SET government_level = 'bilateral',
    last_updated_at = now(),
    updated_at = now()
WHERE organisation_type = 'bilateral'
  AND COALESCE(government_level, '') NOT IN ('bilateral', 'industry', 'local');

-- Rule 3: special case — Invest Northern Ireland uses organisation_type
-- 'federal_agency' but is a UK regional dev agency, not domestic AU. Tag
-- it as 'international' to match its peer foreign trade agencies.
UPDATE trade_investment_agencies
SET government_level = 'international',
    last_updated_at = now(),
    updated_at = now()
WHERE slug = 'invest-northern-ireland'
  AND COALESCE(government_level, '') <> 'international';
