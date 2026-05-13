-- Phase 3.6 fixup: when needs_re_research was already false but domain/website_url
-- were null, the strict apply rule from §3.6 left them empty even though the
-- research sub-agents had verified the canonical site. Backfill those nulls
-- from staging.

UPDATE trade_investment_agencies tia
SET domain = s.enrichment->>'verified_domain',
    last_updated_at = now()
FROM trade_agencies_enrichment_staging s
WHERE s.source_id = tia.id
  AND s.status = 'applied'
  AND tia.domain IS NULL
  AND COALESCE(s.enrichment->>'verified_domain','') <> '';

UPDATE trade_investment_agencies tia
SET website_url = s.enrichment->>'verified_website',
    last_updated_at = now()
FROM trade_agencies_enrichment_staging s
WHERE s.source_id = tia.id
  AND s.status = 'applied'
  AND tia.website_url IS NULL
  AND COALESCE(s.enrichment->>'verified_website','') <> '';
