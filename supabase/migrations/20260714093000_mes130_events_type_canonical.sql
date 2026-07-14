-- MES-130: canonical event type column
--
-- The free-text events.type column holds 20 compound near-duplicate values
-- ("Conference + Exhibition", "Summit + Pitch Night", …). #430 collapsed them to
-- 7 canonical buckets in the frontend (src/lib/eventTypeBuckets.ts). This moves
-- that classification into the DB so other consumers (and new-row ingest) share
-- one source and the vocabulary can't re-fragment.
--
-- ADDITIVE + REVERSIBLE: adds a nullable type_canonical column and backfills it
-- from the reviewed value->canonical mapping. The original `type` is never
-- modified (rollback = drop the column). The CASE mirrors bucketForEventType()
-- exactly: explicit map for the 20 known values, then a lead-token heuristic for
-- any future value, defaulting to 'other'. Idempotent — safe to re-run.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type_canonical text;

COMMENT ON COLUMN public.events.type_canonical IS
  'MES-130 canonical event bucket (conference|networking|expo-trade-show|pitch-demo-day|festival-showcase|workshop-training|webinar|other). Derived from type; keep in sync with src/lib/eventTypeBuckets.ts.';

UPDATE public.events
SET type_canonical = CASE
  WHEN type IS NULL THEN 'other'
  -- explicit mapping of every value present in prod (docs/audits/mes-130 CSV)
  WHEN type IN ('Networking') THEN 'networking'
  WHEN type IN (
    'Conference','Conference + Exhibition','Conference + Expo',
    'Conference + Investor Presentation','Conference + Networking',
    'Summit','Summit + Exhibition','Summit + Pitch Night'
  ) THEN 'conference'
  WHEN type IN ('Pitch Night') THEN 'pitch-demo-day'
  WHEN type IN (
    'Trade Show + Conference','Trade Show','Trade Exhibition','Expo',
    'Airshow + Trade Exhibition'
  ) THEN 'expo-trade-show'
  WHEN type IN ('Workshop') THEN 'workshop-training'
  WHEN type IN (
    'Festival + Conference','Festival + Conference + Exhibition',
    'Festival + Conference + Startup Expo','Showcase + Networking'
  ) THEN 'festival-showcase'
  -- lead-token heuristic for any unmapped/future value (mirrors the TS order)
  WHEN lower(type) LIKE '%conference%' OR lower(type) LIKE '%summit%' THEN 'conference'
  WHEN lower(type) LIKE '%expo%' OR lower(type) LIKE '%trade%'
    OR lower(type) LIKE '%exhibition%' OR lower(type) LIKE '%airshow%' THEN 'expo-trade-show'
  WHEN lower(type) LIKE '%pitch%' OR lower(type) LIKE '%demo%' THEN 'pitch-demo-day'
  WHEN lower(type) LIKE '%network%' THEN 'networking'
  WHEN lower(type) LIKE '%workshop%' OR lower(type) LIKE '%training%'
    OR lower(type) LIKE '%masterclass%' THEN 'workshop-training'
  WHEN lower(type) LIKE '%festival%' OR lower(type) LIKE '%showcase%' THEN 'festival-showcase'
  WHEN lower(type) LIKE '%webinar%' OR lower(type) LIKE '%online%'
    OR lower(type) LIKE '%virtual%' THEN 'webinar'
  ELSE 'other'
END;
