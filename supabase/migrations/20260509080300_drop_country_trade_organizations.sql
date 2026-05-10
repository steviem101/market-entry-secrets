-- Phase 4.6: drop country_trade_organizations.
-- All 4 rows were duplicates of records already in trade_investment_agencies:
--   American Chamber of Commerce Australia → "American Chamber of Commerce in Australia"
--   British Australian Chamber of Commerce → "Australian British Chamber of Commerce"
--   Enterprise Ireland → "Enterprise Ireland" (exact match)
--   Enterprise Singapore → "Enterprise Singapore" (exact match)
-- The country page TradeOrganizationsSection has been refactored to query
-- trade_investment_agencies (via agencies_report_view) filtered by
-- country_iso2 / jurisdiction. See src/hooks/useCountryTradeOrganizations.ts.

DROP TABLE IF EXISTS country_trade_organizations;
