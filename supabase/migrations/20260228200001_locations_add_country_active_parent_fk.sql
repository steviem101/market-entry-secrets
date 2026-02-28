-- Migration: Add country, active, and parent_location_id columns to locations table
-- These columns enable Australia/NZ filtering, soft-disable, and proper parent hierarchy

-- 1. Add country column with default for existing Australian rows
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Australia';

-- 2. Add active flag for soft-disable
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- 3. Add self-referencing FK for parent location hierarchy (cities → states/regions)
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS parent_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;

-- 4. Indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_locations_country_type ON public.locations(country, location_type);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(active);
CREATE INDEX IF NOT EXISTS idx_locations_parent_location_id ON public.locations(parent_location_id);
