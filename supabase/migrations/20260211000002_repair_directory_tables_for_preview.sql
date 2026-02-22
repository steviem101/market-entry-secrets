-- ============================================================================
-- REPAIR MIGRATION: Ensure directory tables exist for Supabase Preview
-- ============================================================================
-- Migrations 20250614062730 (trade_investment_agencies) and
-- 20250615035833 (service_providers, innovation_ecosystem) create these
-- tables with bare CREATE TABLE + triggers. If the trigger function
-- doesn't exist yet or any statement fails, the entire migration rolls
-- back and the tables are never created.
--
-- Migration 20260222000003 then ALTERs all three tables and fails with
-- "relation does not exist".
--
-- Migration 20250622032345 creates countries + country_trade_organizations
-- and ALTERs community_members (adding origin_country, associated_countries).
-- That migration can also roll back in Preview.
--
-- This repair uses IF NOT EXISTS so it's a no-op in production.
-- ============================================================================

-- ============================================
-- service_providers
-- (Original: 20250615035833, ALTER: 20260222000003 serves_personas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]',
  contact_persons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Added by 20260222000003
  serves_personas TEXT[] DEFAULT '{}'
);

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at_service_providers
    BEFORE UPDATE ON public.service_providers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- innovation_ecosystem
-- (Original: 20250615035833, ALTER: 20260222000003 serves_personas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.innovation_ecosystem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]',
  contact_persons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Added by 20260222000003
  serves_personas TEXT[] DEFAULT '{}'
);

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at_innovation_ecosystem
    BEFORE UPDATE ON public.innovation_ecosystem
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- trade_investment_agencies
-- (Original: 20250614062730, ALTER: 20260222000003 serves_personas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trade_investment_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]'::jsonb,
  contact_persons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Added by 20260222000003
  serves_personas TEXT[] DEFAULT '{}'
);

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.trade_investment_agencies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- countries
-- (Original: 20250622032345 — bare CREATE TABLE, can roll back)
-- ============================================
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'country',
  trade_relationship_strength TEXT CHECK (trade_relationship_strength IN ('Strong', 'Growing', 'Emerging')) DEFAULT 'Growing',
  economic_indicators JSONB DEFAULT '{}',
  key_industries TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content_keywords TEXT[] NOT NULL DEFAULT '{}',
  service_keywords TEXT[] NOT NULL DEFAULT '{}',
  event_keywords TEXT[] NOT NULL DEFAULT '{}',
  lead_keywords TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TRIGGER handle_countries_updated_at
    BEFORE UPDATE ON public.countries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- country_trade_organizations
-- (Original: 20250622032345 — bare CREATE TABLE, can roll back)
-- ============================================
CREATE TABLE IF NOT EXISTS public.country_trade_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'trade_agency',
  founded TEXT NOT NULL,
  location TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  contact_persons JSONB DEFAULT '[]',
  experience_tiles JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TRIGGER handle_country_trade_organizations_updated_at
    BEFORE UPDATE ON public.country_trade_organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- community_members — add columns from 20250622032345 that may not exist
-- (Table itself created by 20250610000000 with IF NOT EXISTS — it exists,
--  but the ALTER in 20250622032345 can roll back with the rest of that migration)
-- ============================================
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS origin_country TEXT;

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS associated_countries TEXT[] DEFAULT '{}';
