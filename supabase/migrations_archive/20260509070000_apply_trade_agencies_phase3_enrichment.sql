-- Phase 3.6 — apply staged enrichment to trade_investment_agencies.
-- Only acts on staging rows with status='pending' (the 1 'invalid' AMCC row is skipped).
-- Per-field rules per §3.6 of the trade-agencies cleanup spec:
--   text fields, booleans, numerics: overwrite if currently null/empty
--   description: overwrite if length<100 or length=400 (truncated)
--   description_full: overwrite if currently null and new is meaningfully longer
--   location_city: overwrite if currently null OR matches address pattern
--   support_types, experience_tiles: REPLACE entirely
--   domain, website_url: overwrite if needs_re_research=true AND verified differs

UPDATE trade_investment_agencies tia
SET
  tagline = CASE
    WHEN COALESCE(tia.tagline, '') = ''
         AND COALESCE(s.enrichment->>'tagline','') <> ''
    THEN s.enrichment->>'tagline'
    ELSE tia.tagline
  END,
  basic_info = CASE
    WHEN COALESCE(tia.basic_info, '') = ''
         AND COALESCE(s.enrichment->>'basic_info','') <> ''
    THEN s.enrichment->>'basic_info'
    ELSE tia.basic_info
  END,
  why_work_with_us = CASE
    WHEN COALESCE(tia.why_work_with_us, '') = ''
         AND COALESCE(s.enrichment->>'why_work_with_us','') <> ''
    THEN s.enrichment->>'why_work_with_us'
    ELSE tia.why_work_with_us
  END,
  linkedin_url = CASE
    WHEN COALESCE(tia.linkedin_url, '') = ''
         AND COALESCE(s.enrichment->>'linkedin_url','') <> ''
    THEN s.enrichment->>'linkedin_url'
    ELSE tia.linkedin_url
  END,
  government_level = CASE
    WHEN COALESCE(tia.government_level, '') = ''
         AND COALESCE(s.enrichment->>'government_level','') <> ''
    THEN s.enrichment->>'government_level'
    ELSE tia.government_level
  END,
  description = CASE
    WHEN (LENGTH(tia.description) < 100 OR LENGTH(tia.description) = 400)
         AND COALESCE(s.enrichment->>'description_short','') <> ''
    THEN s.enrichment->>'description_short'
    ELSE tia.description
  END,
  description_full = CASE
    WHEN tia.description_full IS NULL
         AND COALESCE(s.enrichment->>'description_full','') <> ''
         AND LENGTH(s.enrichment->>'description_full') > GREATEST(LENGTH(COALESCE(tia.description,'')), 200)
    THEN s.enrichment->>'description_full'
    ELSE tia.description_full
  END,
  founded_year = CASE
    WHEN tia.founded_year IS NULL
         AND COALESCE(s.enrichment->>'founded_year','') <> ''
    THEN s.enrichment->>'founded_year'
    ELSE tia.founded_year
  END,
  employees = CASE
    WHEN tia.employees = ''
         AND COALESCE(s.enrichment->>'employees_range','') <> ''
    THEN s.enrichment->>'employees_range'
    ELSE tia.employees
  END,
  location_city = CASE
    WHEN (tia.location_city IS NULL
          OR tia.location_city ~* '(street| st |avenue|level|suite|floor|house|building|tower)'
          OR tia.location_city ~ '^[0-9]')
         AND COALESCE(s.enrichment->>'location_city','') <> ''
    THEN s.enrichment->>'location_city'
    ELSE tia.location_city
  END,
  location_state = CASE
    WHEN tia.location_state IS NULL
         AND COALESCE(s.enrichment->>'location_state','') <> ''
    THEN s.enrichment->>'location_state'
    ELSE tia.location_state
  END,
  jurisdiction = CASE
    WHEN COALESCE(array_length(tia.jurisdiction, 1), 0) = 0
         AND COALESCE(jsonb_array_length(s.enrichment->'jurisdiction'), 0) > 0
    THEN ARRAY(SELECT jsonb_array_elements_text(s.enrichment->'jurisdiction'))
    ELSE tia.jurisdiction
  END,
  sectors_supported = CASE
    WHEN COALESCE(array_length(tia.sectors_supported, 1), 0) = 0
         AND COALESCE(jsonb_array_length(s.enrichment->'sectors_supported'), 0) > 0
    THEN ARRAY(SELECT jsonb_array_elements_text(s.enrichment->'sectors_supported'))
    ELSE tia.sectors_supported
  END,
  target_company_stage = CASE
    WHEN COALESCE(array_length(tia.target_company_stage, 1), 0) = 0
         AND COALESCE(jsonb_array_length(s.enrichment->'target_company_stage'), 0) > 0
    THEN ARRAY(SELECT jsonb_array_elements_text(s.enrichment->'target_company_stage'))
    ELSE tia.target_company_stage
  END,
  support_types = CASE
    WHEN COALESCE(jsonb_array_length(s.enrichment->'support_types'), 0) > 0
    THEN ARRAY(SELECT jsonb_array_elements_text(s.enrichment->'support_types'))
    ELSE tia.support_types
  END,
  experience_tiles = CASE
    WHEN COALESCE(jsonb_array_length(s.enrichment->'experience_tiles'), 0) > 0
    THEN s.enrichment->'experience_tiles'
    ELSE tia.experience_tiles
  END,
  is_government_funded = CASE
    WHEN tia.is_government_funded IS NULL
         AND jsonb_typeof(s.enrichment->'is_government_funded') = 'boolean'
    THEN (s.enrichment->>'is_government_funded')::boolean
    ELSE tia.is_government_funded
  END,
  membership_required = CASE
    WHEN tia.membership_required IS NULL
         AND jsonb_typeof(s.enrichment->'membership_required') = 'boolean'
    THEN (s.enrichment->>'membership_required')::boolean
    ELSE tia.membership_required
  END,
  membership_fee_aud = CASE
    WHEN tia.membership_fee_aud IS NULL
         AND jsonb_typeof(s.enrichment->'membership_fee_aud') = 'number'
    THEN (s.enrichment->>'membership_fee_aud')::integer
    ELSE tia.membership_fee_aud
  END,
  grants_available = CASE
    WHEN tia.grants_available IS NULL
         AND jsonb_typeof(s.enrichment->'grants_available') = 'boolean'
    THEN (s.enrichment->>'grants_available')::boolean
    ELSE tia.grants_available
  END,
  max_grant_aud = CASE
    WHEN tia.max_grant_aud IS NULL
         AND jsonb_typeof(s.enrichment->'max_grant_aud') = 'number'
    THEN (s.enrichment->>'max_grant_aud')::integer
    ELSE tia.max_grant_aud
  END,
  domain = CASE
    WHEN tia.needs_re_research = true
         AND COALESCE(s.enrichment->>'verified_domain','') <> ''
         AND COALESCE(tia.domain,'') <> COALESCE(s.enrichment->>'verified_domain','')
    THEN s.enrichment->>'verified_domain'
    ELSE tia.domain
  END,
  website_url = CASE
    WHEN tia.needs_re_research = true
         AND COALESCE(s.enrichment->>'verified_website','') <> ''
         AND COALESCE(tia.website_url,'') <> COALESCE(s.enrichment->>'verified_website','')
    THEN s.enrichment->>'verified_website'
    ELSE tia.website_url
  END,
  needs_re_research = false,
  last_updated_at = now(),
  updated_at = now()
FROM trade_agencies_enrichment_staging s
WHERE s.source_id = tia.id AND s.status = 'pending';

-- Mark the staging rows as applied
UPDATE trade_agencies_enrichment_staging
SET status = 'applied', applied_at = now(), reviewed_at = now()
WHERE status = 'pending';
