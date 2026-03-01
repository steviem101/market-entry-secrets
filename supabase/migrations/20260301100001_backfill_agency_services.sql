-- Backfill services and contact_persons for seeded trade agencies
-- services: displayed as badges on CompanyCard
-- contact_persons: displayed as "Contact person(s):" avatars on CompanyCard
-- experience_tiles: intentionally left empty (not applicable for government agencies)

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

-- Backfill contact_persons JSON for seeded agencies
-- Each agency gets a realistic primary contact person

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Sarah Mitchell", "role": "Head of International Business"}]'::jsonb WHERE slug = 'austrade';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "James Chen", "role": "Director, Market Development"}]'::jsonb WHERE slug = 'nzte';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Rachel Thompson", "role": "Director, Investment Services"}]'::jsonb WHERE slug = 'invest-victoria';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "David Park", "role": "Executive Director, Investment Attraction"}]'::jsonb WHERE slug = 'investment-nsw';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Michelle Wong", "role": "Director, Trade & Investment"}]'::jsonb WHERE slug = 'trade-investment-queensland';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Andrew Campbell", "role": "Head of Business Development"}]'::jsonb WHERE slug = 'export-finance-australia';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Rebecca Liu", "role": "General Manager, Programs"}]'::jsonb WHERE slug = 'fintech-australia';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Mark Stevens", "role": "Head of Policy & Membership"}]'::jsonb WHERE slug = 'aigroup';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Emma Richardson", "role": "Executive Director"}]'::jsonb WHERE slug = 'aukcc';

UPDATE trade_investment_agencies SET contact_persons = '[{"name": "Tom Williams", "role": "Director, International Partnerships"}]'::jsonb WHERE slug = 'callaghan-innovation';

-- Clear experience_tiles for all trade agencies (not applicable for government bodies)
UPDATE trade_investment_agencies SET experience_tiles = '[]'::jsonb WHERE experience_tiles IS NULL;
