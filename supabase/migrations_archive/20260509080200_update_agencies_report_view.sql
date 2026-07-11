-- Phase 4.3: update agencies_report_view to expose primary_contacts +
-- team_contacts (both filtered to is_archived = false). primary_contacts
-- always has 1 row per agency (the highest-ranked non-hidden contact);
-- team_contacts is the rest of the visible contacts ordered by display_order.

DROP VIEW IF EXISTS agencies_report_view;

CREATE VIEW agencies_report_view AS
SELECT
  tia.id,
  tia.name,
  tia.slug,
  tia.tagline,
  tia.description,
  tia.description_full,
  tia.logo,
  tia.website_url,
  tia.website,
  tia.email,
  tia.phone,
  tia.linkedin_url,
  tia.organisation_type,
  tia.government_level,
  tia.category_slug,
  oc.name AS category_name,
  oc.icon AS category_icon,
  oc.colour AS category_colour,
  tia.jurisdiction,
  tia.sectors_supported,
  tia.support_types,
  tia.target_company_origin,
  tia.target_company_stage,
  tia.is_government_funded,
  tia.is_free_to_access,
  tia.membership_required,
  tia.membership_fee_aud,
  tia.grants_available,
  tia.max_grant_aud,
  tia.location,
  tia.location_city,
  tia.location_state,
  tia.location_country,
  tia.has_multiple_locations,
  tia.founded,
  tia.founded_year,
  tia.employees,
  tia.is_verified,
  tia.is_featured,
  tia.is_active,
  tia.view_count,
  tia.meta_title,
  tia.meta_description,
  tia.last_updated_at,
  tia.services,
  tia.basic_info,
  tia.why_work_with_us,
  tia.contact,
  tia.contact_persons,
  tia.experience_tiles,
  tia.domain,
  tia.country_iso2,
  (
    SELECT json_agg(
      json_build_object(
        'name', ac.full_name,
        'title', ac.title,
        'email', ac.email,
        'linkedin_url', ac.linkedin_url,
        'mes_relevance_score', ac.mes_relevance_score,
        'tier', ac.tier
      ) ORDER BY ac.display_order
    )
    FROM agency_contacts ac
    WHERE ac.agency_id = tia.id
      AND ac.is_primary = true
      AND ac.is_archived = false
  ) AS primary_contacts,
  (
    SELECT json_agg(
      json_build_object(
        'name', ac.full_name,
        'title', ac.title,
        'linkedin_url', ac.linkedin_url,
        'tier', ac.tier
      ) ORDER BY ac.display_order
    )
    FROM agency_contacts ac
    WHERE ac.agency_id = tia.id
      AND ac.is_primary = false
      AND ac.is_archived = false
  ) AS team_contacts,
  (
    SELECT json_agg(
      json_build_object(
        'title', ar.title,
        'type', ar.resource_type,
        'value', ar.max_value_aud,
        'url', ar.url
      )
    )
    FROM agency_resources ar
    WHERE ar.agency_id = tia.id AND ar.is_active = true
  ) AS resources
FROM trade_investment_agencies tia
LEFT JOIN organisation_categories oc ON oc.slug = tia.category_slug
WHERE tia.is_active = true;
