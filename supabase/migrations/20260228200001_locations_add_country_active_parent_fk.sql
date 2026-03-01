-- Migration: Ensure locations table exists with all columns including new ones
-- Handles both fresh preview environments (CREATE) and production (ALTER)

-- 1. Ensure handle_updated_at function exists (dependency)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Create the full locations table if it doesn't exist (fresh preview environments)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('state', 'city', 'region')),
  parent_location TEXT,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  government_agency_name TEXT,
  government_agency_contact TEXT,
  government_agency_website TEXT,
  business_environment_score INTEGER CHECK (business_environment_score >= 0 AND business_environment_score <= 100),
  startup_ecosystem_strength TEXT CHECK (startup_ecosystem_strength IN ('Strong', 'Growing', 'Emerging')),
  key_industries TEXT[] NOT NULL DEFAULT '{}',
  population INTEGER,
  economic_indicators JSONB DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content_keywords TEXT[] NOT NULL DEFAULT '{}',
  service_keywords TEXT[] NOT NULL DEFAULT '{}',
  event_keywords TEXT[] NOT NULL DEFAULT '{}',
  lead_keywords TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- New columns included in initial creation for fresh environments
  country TEXT NOT NULL DEFAULT 'Australia',
  active BOOLEAN NOT NULL DEFAULT true,
  parent_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL
);

-- 3. Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at' AND tgrelid = 'public.locations'::regclass
  ) THEN
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.locations
      FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END;
$$;

-- 4. For existing environments where table exists but new columns don't: add them
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'Australia';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS parent_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;

-- 5. Indexes (IF NOT EXISTS is idempotent)
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_featured ON public.locations(featured);
CREATE INDEX IF NOT EXISTS idx_locations_location_type ON public.locations(location_type);
CREATE INDEX IF NOT EXISTS idx_locations_sort_order ON public.locations(sort_order);
CREATE INDEX IF NOT EXISTS idx_locations_country_type ON public.locations(country, location_type);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(active);
CREATE INDEX IF NOT EXISTS idx_locations_parent_location_id ON public.locations(parent_location_id);
