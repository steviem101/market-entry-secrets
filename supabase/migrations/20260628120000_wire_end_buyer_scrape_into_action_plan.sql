-- Wire the scraped end-buyer intelligence into the action_plan report template.
--
-- The generate-report pipeline scrapes up to 3 user-named end-buyer websites
-- (scrapeEndBuyers) and extracts per-company procurement intelligence, but no
-- template consumed its output — `end_buyers_scraped_json` / `end_buyers_analysis_json`
-- were dead template variables, so the Firecrawl + AI credits spent on them were
-- discarded (Stage 1 Firecrawl audit, P0). This surfaces that intelligence in the
-- Phase 3 go-to-market guidance of the action_plan section.
--
-- The new content sits inside a {{#end_buyers_scraped_json}}...{{/end_buyers_scraped_json}}
-- conditional block, so it drops cleanly (via renderConditionalBlocks /
-- isEmptyTemplateValue) when no end buyers were provided and the variable is "[]".
-- Anti-hallucination discipline mirrors the rest of the template: use only facts
-- present in the data.
--
-- Additive, non-destructive, and idempotent: guarded by a NOT LIKE marker so a
-- re-run is a no-op, and a single-row content update (not a schema or bulk change).

UPDATE report_templates
SET
  prompt_body = replace(
    prompt_body,
    E'Target customer procurement intelligence:\n{{end_buyer_research}}',
    E'Target customer procurement intelligence:\n{{end_buyer_research}}\n'
    || E'{{#end_buyers_scraped_json}}\n'
    || E'Per-company intelligence on the specific target buyers {{company_name}} named, extracted from each buyer''s own website (JSON array of objects with name, url, description and key_info — what they do, what they procure, and how to sell to them):\n'
    || E'{{end_buyers_scraped_json}}\n'
    || E'Use this named-buyer intelligence to make the Phase 3 go-to-market and sales approach concrete: tailor the channel and partnership strategy to how these specific buyers actually procure. Use ONLY facts present in this data — do NOT invent procurement processes, named contacts, or supplier requirements that are not stated here.\n'
    || E'{{/end_buyers_scraped_json}}'
  ),
  variables = (
    SELECT array_agg(DISTINCT v ORDER BY v)
    FROM unnest(variables || ARRAY['end_buyers_scraped_json']) AS v
  ),
  version = version + 1,
  updated_at = now()
WHERE section_name = 'action_plan'
  AND is_active = true
  AND prompt_body LIKE '%Target customer procurement intelligence:%'
  AND prompt_body NOT LIKE '%Per-company intelligence on the specific target buyers%';
