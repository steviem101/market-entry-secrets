-- ============================================================================
-- REPAIR MIGRATION: Ensure testimonials table exists for Supabase Preview
-- ============================================================================
-- Migration 20250624112550 creates the testimonials table, but it can fail in
-- Preview environments (trigger/function dependency rollback). Later migration
-- 20260222000002 ALTERs this table and fails with
-- "relation public.testimonials does not exist".
--
-- This repair uses IF NOT EXISTS so it's a no-op in production where the
-- table already exists. In Preview, it creates the table with the full
-- final schema (all columns from all migrations combined).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  country_name TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  outcome TEXT NOT NULL,
  avatar TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Added by 20260222000002
  target_personas TEXT[] DEFAULT '{}'
);

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Re-create policies with exception handlers (no-op if they already exist)
DO $$ BEGIN
  CREATE POLICY "Public can view testimonials"
    ON public.testimonials FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can manage testimonials"
    ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Re-create the updated_at trigger (safe if already exists)
DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
