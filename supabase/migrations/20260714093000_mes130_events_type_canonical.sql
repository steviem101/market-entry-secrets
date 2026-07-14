-- MES-130: canonical event type column (derived + always fresh)
--
-- The free-text events.type column holds 20 compound near-duplicate values
-- ("Conference + Exhibition", "Summit + Pitch Night", …). #430 collapsed them to
-- 7 canonical buckets in the frontend (src/lib/eventTypeBuckets.ts). This moves
-- that classification into the DB as a *derived* column so ingest and other
-- consumers share one source and the vocabulary can't re-fragment.
--
-- type_canonical is owned by a BEFORE INSERT/UPDATE trigger — it is always
-- recomputed from `type`, never hand-set — so it can never go stale relative to
-- `type` (the read path prefers it, so staleness would be a user-visible bug),
-- and every ingested/edited row is classified automatically without touching
-- normalize-events. The classification function is the single source the SQL
-- side owns; it mirrors bucketForEventType() in src/lib/eventTypeBuckets.ts.
--
-- ADDITIVE + REVERSIBLE: `type` is never modified. Rollback = drop the trigger,
-- function, and column. The backfill/trigger are idempotent (pure function of
-- `type`).

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type_canonical text;

COMMENT ON COLUMN public.events.type_canonical IS
  'MES-130 canonical event bucket (conference|networking|expo-trade-show|pitch-demo-day|festival-showcase|workshop-training|webinar|other). DERIVED from type by the events_type_canonical trigger — do not hand-set. Keep the mapping in sync with src/lib/eventTypeBuckets.ts.';

-- Single classification source for the SQL side. IMMUTABLE (pure function of the
-- input); mirrors bucketForEventType(): explicit map for the known values, then
-- a lead-token heuristic for any future value, default 'other'.
CREATE OR REPLACE FUNCTION public.event_type_to_canonical(p_type text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_type IS NULL THEN 'other'
    WHEN p_type IN ('Networking') THEN 'networking'
    WHEN p_type IN (
      'Conference','Conference + Exhibition','Conference + Expo',
      'Conference + Investor Presentation','Conference + Networking',
      'Summit','Summit + Exhibition','Summit + Pitch Night'
    ) THEN 'conference'
    WHEN p_type IN ('Pitch Night') THEN 'pitch-demo-day'
    WHEN p_type IN (
      'Trade Show + Conference','Trade Show','Trade Exhibition','Expo',
      'Airshow + Trade Exhibition'
    ) THEN 'expo-trade-show'
    WHEN p_type IN ('Workshop') THEN 'workshop-training'
    WHEN p_type IN (
      'Festival + Conference','Festival + Conference + Exhibition',
      'Festival + Conference + Startup Expo','Showcase + Networking'
    ) THEN 'festival-showcase'
    -- lead-token heuristic for any unmapped/future value (mirrors the TS order)
    WHEN lower(p_type) LIKE '%conference%' OR lower(p_type) LIKE '%summit%' THEN 'conference'
    WHEN lower(p_type) LIKE '%expo%' OR lower(p_type) LIKE '%trade%'
      OR lower(p_type) LIKE '%exhibition%' OR lower(p_type) LIKE '%airshow%' THEN 'expo-trade-show'
    WHEN lower(p_type) LIKE '%pitch%' OR lower(p_type) LIKE '%demo%' THEN 'pitch-demo-day'
    WHEN lower(p_type) LIKE '%network%' THEN 'networking'
    WHEN lower(p_type) LIKE '%workshop%' OR lower(p_type) LIKE '%training%'
      OR lower(p_type) LIKE '%masterclass%' THEN 'workshop-training'
    WHEN lower(p_type) LIKE '%festival%' OR lower(p_type) LIKE '%showcase%' THEN 'festival-showcase'
    WHEN lower(p_type) LIKE '%webinar%' OR lower(p_type) LIKE '%online%'
      OR lower(p_type) LIKE '%virtual%' THEN 'webinar'
    ELSE 'other'
  END;
$$;

-- Keep type_canonical in lockstep with type on every write.
CREATE OR REPLACE FUNCTION public.events_set_type_canonical()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.type_canonical := public.event_type_to_canonical(NEW.type);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_type_canonical ON public.events;
CREATE TRIGGER events_type_canonical
  BEFORE INSERT OR UPDATE OF type ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.events_set_type_canonical();

-- One-time backfill of existing rows (idempotent — pure function of type).
UPDATE public.events SET type_canonical = public.event_type_to_canonical(type);
