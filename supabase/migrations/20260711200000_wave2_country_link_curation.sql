-- Wave 2 country-link curation: review the pending rule-proposed links for
-- the United Kingdom, United States, Singapore, Canada, Japan, South Korea,
-- and France (Ireland was curated in wave 1).
--
-- Review outcome (2026-07-11): the origin-country rule matches are grounded in
-- stored data (community_members.origin_country, agency iso2/jurisdiction), so
-- pending links are approved with archetype-based relevance; the best few per
-- live country get featured status and corridor blurbs grounded in their
-- stored role/company. One false match is rejected (the Italian Chamber's
-- jurisdiction array spuriously matched Canada), and duplicate agency rows
-- (DIT/DBT, the two AmCham and two US-embassy rows) are demoted so tabs
-- surface one of each.
--
-- Idempotent: bulk blocks only touch status='pending'; curation blocks set
-- absolute values keyed by country slug + entity identity.

----------------------------------------------------------------------
-- 1. Reject the false rule match.
----------------------------------------------------------------------

UPDATE public.country_entity_links l
SET status = 'rejected'
FROM public.countries c, public.trade_investment_agencies t
WHERE l.country_id = c.id AND c.slug = 'canada'
  AND l.entity_type = 'agency' AND l.entity_id = t.id
  AND t.slug = 'italian-chamber-of-commerce-in-australia-melbourne';

----------------------------------------------------------------------
-- 2. Bulk approval of the remaining pending links.
--    Mentors: Trade & Government archetype ranks above operators by default.
----------------------------------------------------------------------

UPDATE public.country_entity_links l
SET status = 'approved',
    relevance = CASE WHEN cm.archetype = 'Trade & Government' THEN 7 ELSE 6 END,
    verified_at = now()
FROM public.community_members cm
WHERE l.entity_type = 'mentor' AND l.entity_id = cm.id
  AND l.status = 'pending';

UPDATE public.country_entity_links l
SET status = 'approved',
    relevance = 6,
    verified_at = now()
WHERE l.entity_type = 'agency'
  AND l.status = 'pending';

----------------------------------------------------------------------
-- 3. Featured agencies per country (blurbs grounded in each agency's
--    stored role; relationship reflects which side of the corridor).
----------------------------------------------------------------------

UPDATE public.country_entity_links l
SET relationship = v.relationship,
    relevance    = v.relevance,
    blurb        = v.blurb,
    is_featured  = v.is_featured,
    status       = 'approved'
FROM public.countries c,
     public.trade_investment_agencies t,
     (VALUES
       ('united-kingdom', 'department-for-business-and-trade', 'origin_support', 10, true,
        'The UK government''s trade department. The first call for British companies selling into Australia.'),
       ('united-kingdom', 'australian-british-chamber-of-commerce', 'community', 9, true,
        'The standing UK-Australia business network. Chamber events are where British entrants meet their first Australian customers.'),
       ('united-kingdom', 'aukcc', 'community', 8, false,
        'The Australia-United Kingdom Chamber of Commerce, working the corridor from the UK side.'),
       ('united-kingdom', 'uk-department-for-international-trade', 'origin_support', 5, false, NULL),
       ('united-states', 'amcham-australia', 'community', 9, true,
        'The American Chamber of Commerce in Australia. The standing network for US companies operating here.'),
       ('united-states', 'us-embassy-in-australia', 'origin_support', 8, true,
        'The official US government presence in Australia, including commercial support for American exporters.'),
       ('united-states', 'american-chamber-of-commerce-in-australia', 'community', 5, false, NULL),
       ('united-states', 'embassy-of-the-united-states-of-america', 'origin_support', 5, false, NULL),
       ('singapore', 'enterprise-singapore', 'origin_support', 10, true,
        'Singapore''s enterprise development agency. The first call for Singaporean companies expanding into ANZ.'),
       ('singapore', 'singapore-chamber-of-commerce-western-australia', 'community', 8, false, NULL),
       ('canada', 'trade-commissioner-service-canada', 'origin_support', 10, true,
        'Canada''s Trade Commissioner Service. The origin-side desk for Canadian exporters entering Australia.'),
       ('canada', 'export-development-canada', 'origin_support', 9, true,
        'Canada''s export credit agency, financing Canadian companies growing into new markets including ANZ.'),
       ('canada', 'canadian-consulate-global-affairs-canada', 'origin_support', 8, false, NULL),
       ('japan', 'jetro-japan-external-trade-organization', 'origin_support', 9, false,
        'Japan''s external trade organisation, supporting Japanese companies entering Australia.'),
       ('south-korea', 'kotra', 'origin_support', 9, false,
        'Korea''s trade and investment promotion agency, with an on-the-ground Sydney office.'),
       ('france', 'business-france', 'origin_support', 9, false,
        'The French government''s export agency, supporting French companies entering ANZ.'),
       ('france', 'altios-international', 'community', 7, false, NULL)
     ) AS v(country_slug, agency_slug, relationship, relevance, is_featured, blurb)
WHERE l.country_id = c.id AND c.slug = v.country_slug
  AND l.entity_type = 'agency' AND l.entity_id = t.id AND t.slug = v.agency_slug;

----------------------------------------------------------------------
-- 4. Featured mentors for the live corridor pages (UK, US, SG, CA).
--    Blurbs are grounded in stored role/company/origin only.
----------------------------------------------------------------------

UPDATE public.country_entity_links l
SET relationship = v.relationship,
    relevance    = v.relevance,
    blurb        = v.blurb,
    is_featured  = true,
    status       = 'approved'
FROM public.countries c,
     public.community_members cm,
     (VALUES
       ('united-kingdom', 'Martin McCann', 'community', 9,
        'Founder and CEO of Trade Ledger. A UK-origin fintech founder building from Australia; knows the corridor from both ends.'),
       ('united-kingdom', 'Clayton Howes', 'community', 9,
        'CEO of MONEYME. Made the UK to Australia move and scaled a consumer fintech on the ground.'),
       ('united-kingdom', 'Liza Noonan', 'community', 8,
        'CEO of Cicada Innovations, one of Australia''s flagship deep-tech incubators and a natural first landing contact.'),
       ('united-kingdom', 'Duco van Breemen', 'landing_support', 8,
        'CEO of Haymarket HQ, the Sydney hub built around landing international founders.'),
       ('united-kingdom', 'Fiona Stevens', 'community', 8,
        'Chief Commercial Officer at Airtasker. A UK-origin operator inside one of Australia''s best-known marketplaces.'),
       ('united-kingdom', 'Tom Ward', 'landing_support', 8,
        'Senior Export Advisor at Investment NSW. The landing-side desk for UK companies setting up in Sydney.'),
       ('united-states', 'Sarah Nolet', 'community', 9,
        'Co-Founder and General Partner at Tenacious Ventures. A US-origin investor building in Australian agrifood tech.'),
       ('united-states', 'Robert Gallup', 'community', 9,
        'Founder of Oz2US Ventures, focused squarely on the Australia-US corridor.'),
       ('united-states', 'David Camerlengo', 'landing_support', 9,
        'Executive Director, Investment and Industry at Investment NSW. The landing-side door for major US investment into Sydney.'),
       ('united-states', 'Jacqui Duncan', 'landing_support', 8,
        'General Manager NSW at Stone & Chalk, a common first base for inbound US founders.'),
       ('united-states', 'Dan Jovevski', 'community', 8,
        'Founder and CEO of consumer fintech WeMoney.'),
       ('united-states', 'Bryan Williams', 'community', 7,
        'Founder of Hockey Stick Advisory, advising founders working the US-Australia corridor.'),
       ('singapore', 'Aik Kanhalykham', 'origin_support', 9,
        'Senior Business Development Manager at Enterprise Singapore. An official channel for Singaporean companies entering ANZ.'),
       ('singapore', 'Suzanne M.', 'origin_support', 9,
        'Senior Business Development Manager, Trade and Investment at Enterprise Singapore.'),
       ('singapore', 'Kirk Drage', 'community', 8,
        'CEO and Co-founder of LeapSheep.'),
       ('singapore', 'Navaid Khatib', 'community', 7,
        'Board Member at Australian Payments Network.'),
       ('canada', 'Diane Belliveau', 'origin_support', 9,
        'Chief Representative for Australia and New Zealand at Export Development Canada. The origin-side financing channel for Canadian exporters.'),
       ('canada', 'Sarah Quigley', 'origin_support', 8,
        'Acting Consul General of Canada: the official Canadian government presence for market entrants.'),
       ('canada', 'Cheryl Mack', 'community', 8,
        'CEO of Aussie Angels, at the centre of Australia''s angel investing community.')
     ) AS v(country_slug, mentor_name, relationship, relevance, blurb)
WHERE l.country_id = c.id AND c.slug = v.country_slug
  AND l.entity_type = 'mentor' AND l.entity_id = cm.id AND cm.name = v.mentor_name;
