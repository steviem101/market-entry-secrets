-- Backfill services array for seeded trade agencies
-- The services column is what CompanyCard displays as badges

UPDATE trade_investment_agencies SET services = ARRAY[
  'Export Support', 'Market Intelligence', 'Trade Missions',
  'Landing Programs', 'Business Matchmaking', 'Grants & Funding'
] WHERE slug = 'austrade';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Market Intelligence', 'Business Matchmaking', 'Landing Programs',
  'Trade Missions', 'International Connections'
] WHERE slug = 'nzte';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Market Intelligence', 'Site Selection', 'Business Matchmaking',
  'Landing Programs', 'Government Liaison'
] WHERE slug = 'invest-victoria';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Market Intelligence', 'Business Matchmaking', 'Site Selection',
  'Government Liaison', 'Investment Facilitation'
] WHERE slug = 'investment-nsw';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Market Intelligence', 'Trade Missions', 'Business Matchmaking',
  'Export Programs', 'Investment Attraction'
] WHERE slug = 'trade-investment-queensland';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Export Finance', 'Loans & Guarantees', 'Bonds',
  'Trade Insurance', 'Grants & Funding'
] WHERE slug = 'export-finance-australia';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Networking & Events', 'Industry Advocacy', 'Regulatory Reform',
  'Market Intelligence', 'Intersekt Conference'
] WHERE slug = 'fintech-australia';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Industry Advocacy', 'Networking & Events', 'Policy & Research',
  'Workforce Development', 'Market Intelligence'
] WHERE slug = 'aigroup';

UPDATE trade_investment_agencies SET services = ARRAY[
  'Networking & Events', 'Trade Missions', 'Business Matchmaking',
  'Market Intelligence', 'FTA Support'
] WHERE slug = 'aukcc';

UPDATE trade_investment_agencies SET services = ARRAY[
  'R&D Grants', 'Technical Expertise', 'Innovation Support',
  'Market Intelligence', 'Research Connections'
] WHERE slug = 'callaghan-innovation';
