-- Phase 4.2: explode contact_persons jsonb into rows in agency_contacts.
-- Idempotent: only runs when agency_contacts is empty so re-applying the
-- migration set on a clean db won't double up rows.
--
-- Per-agency primary contact selection rule:
--   1. non-hidden contacts win over hidden
--   2. tie-break on highest mes_relevance_score
--   3. final tie-break on lowest priority

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM agency_contacts) = 0 THEN
    INSERT INTO agency_contacts (
      agency_id, full_name, title, email, linkedin_url,
      is_primary, display_order, is_archived, mes_relevance_score, tier, created_at
    )
    SELECT
      tia.id AS agency_id,
      cp->>'name' AS full_name,
      cp->>'role' AS title,
      NULLIF(cp->>'email', '') AS email,
      NULLIF(cp->>'linkedin_url', '') AS linkedin_url,
      ROW_NUMBER() OVER (
        PARTITION BY tia.id
        ORDER BY
          COALESCE((cp->>'hidden')::boolean, false) ASC,
          COALESCE(NULLIF(cp->>'mes_relevance_score','')::numeric, 0) DESC,
          COALESCE(NULLIF(cp->>'priority','')::int, 99) ASC
      ) = 1 AS is_primary,
      COALESCE(NULLIF(cp->>'priority','')::int, 99) AS display_order,
      COALESCE((cp->>'hidden')::boolean, false) AS is_archived,
      NULLIF(cp->>'mes_relevance_score','')::int AS mes_relevance_score,
      cp->>'tier' AS tier,
      now() AS created_at
    FROM trade_investment_agencies tia
    CROSS JOIN LATERAL jsonb_array_elements(tia.contact_persons) AS cp
    WHERE cp->>'name' IS NOT NULL AND cp->>'name' <> '';
  END IF;
END$$;
