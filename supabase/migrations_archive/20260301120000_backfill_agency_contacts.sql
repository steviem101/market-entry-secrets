-- Backfill contact_persons for seeded trade agencies
-- Each agency gets a primary contact person displayed on CompanyCard

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
