-- Correct origin_country for national trade-agency mentors so the country-corridor
-- match (+2 in matchScoring.scoreRow) fires reliably for founders from that country.
-- These rows carried garbage seed values (Enterprise Ireland staff tagged 'france' /
-- 'hong_kong', Enterprise Singapore tagged 'uk'), so e.g. Irish founders only ever got
-- the weaker "country mentioned in profile" text boost (+1.5) instead of the structured
-- corridor (+2). For a trade-agency mentor, origin_country represents the corridor the
-- agency serves (its home country). Values are stored in the canonical token form that
-- countryNormalize.normalizeCountry() produces for the founder side.
update public.community_members set origin_country = 'ireland'
  where company ilike '%enterprise ireland%';
update public.community_members set origin_country = 'singapore'
  where company ilike '%enterprise singapore%';
update public.community_members set origin_country = 'new-zealand'
  where company ilike '%new zealand trade%' or company ilike '%nzte%';
update public.community_members set origin_country = 'korea'
  where company ilike '%kotra%';
