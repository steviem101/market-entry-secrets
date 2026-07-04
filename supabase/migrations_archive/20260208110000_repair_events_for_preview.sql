-- ============================================================================
-- REPAIR MIGRATION: Ensure events table exists for Supabase Preview
-- ============================================================================
-- Migration 20250612062940 creates the events table, but it fails in Preview
-- environments (trigger/function dependency rollback). Later migrations
-- (20250711102749, 20250712031455, 20260208112053) ALTER this table and fail
-- with "relation public.events does not exist".
--
-- This repair uses IF NOT EXISTS so it's a no-op in production where the
-- table already exists. In Preview, it creates the table with the full
-- final schema (all columns from all migrations combined).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  attendees INTEGER NOT NULL DEFAULT 0,
  organizer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Added by 20250711102749
  event_logo_url TEXT,
  -- Added by 20250712031455
  sector TEXT,
  -- Added by 20260208112053
  slug TEXT,
  website_url TEXT,
  registration_url TEXT,
  organizer_email TEXT,
  organizer_website TEXT,
  price TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}'::text[],
  image_url TEXT
);

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Re-create policies with exception handlers (no-op if they already exist)
DO $$ BEGIN
  CREATE POLICY "Events are publicly readable"
    ON public.events FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create events"
    ON public.events FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update events"
    ON public.events FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can delete events"
    ON public.events FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Re-create the updated_at trigger (safe if already exists)
DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
