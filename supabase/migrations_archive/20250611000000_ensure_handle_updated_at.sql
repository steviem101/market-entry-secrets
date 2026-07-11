-- Ensure handle_updated_at() exists before any migration that uses it.
-- The earlier file at 20250601 may be skipped by the runner because its
-- timestamp precedes all original migrations. This file at 20250611 runs
-- in the known-working timestamp range (after 20250610, before 20250612).

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
