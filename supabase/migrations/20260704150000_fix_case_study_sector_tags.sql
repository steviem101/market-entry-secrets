-- Fix mis-tagged case-study sector_tags (Stage 7 bug B6).
--
-- An auto-tagger sprinkled objectively-wrong primary/heavy-industry sectors onto
-- software case studies, so e.g. "How OpenAI Entered the Australian Market" was
-- tagged farming-ranching-forestry and surfaced in reports for farming companies;
-- "How GitHub Entered…" was tagged manufacturing. Directory matching keys on
-- content_items.sector_tags via array-overlap, so the bad tags directly caused
-- off-topic case studies to appear.
--
-- This corrects only the unambiguous offenders (the flagged rows + the same class
-- of heavy-industry noise on clearly-software companies). Each UPDATE is scoped by
-- slug + content_type so it's safe to re-run and can't touch unrelated rows.
-- Brighte (financial-services + utilities) is intentionally left untouched — a
-- clean-energy financier legitimately carries "utilities".

UPDATE content_items SET sector_tags = ARRAY['hospitals-and-health-care','technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'eucalyptus-australia-startup';        -- was: construction, hospitals-and-health-care

UPDATE content_items SET sector_tags = ARRAY['technology-information-and-media','accommodation-and-food-services']
  WHERE content_type = 'case_study' AND slug = 'foodora-australia-market-entry';       -- was: farming-ranching-forestry

UPDATE content_items SET sector_tags = ARRAY['technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'github-australia-market-entry';         -- was: financial-services, manufacturing, tech

UPDATE content_items SET sector_tags = ARRAY['education','technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'go1-australia-startup';                 -- was: education, oil-gas-and-mining, tech

UPDATE content_items SET sector_tags = ARRAY['entertainment-providers','technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'immutable-australia-startup';           -- was: construction, entertainment-providers, tech

UPDATE content_items SET sector_tags = ARRAY['technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'openai-australia-market-entry';         -- was: farming-ranching-forestry, financial-services, tech

UPDATE content_items SET sector_tags = ARRAY['technology-information-and-media']
  WHERE content_type = 'case_study' AND slug = 'servicenow-australia-market-entry';     -- was: utilities
