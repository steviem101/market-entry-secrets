-- ============================================================================
-- REPAIR MIGRATION: Ensure content tables exist for Supabase Preview
-- ============================================================================
-- Migration 20250615224335 creates content_categories, content_items,
-- content_company_profiles, content_founders, content_sections, and
-- content_bodies. It uses raw CREATE TABLE / CREATE POLICY / CREATE TRIGGER
-- statements. If any statement fails in Preview, the entire transaction
-- rolls back and none of the tables are created.
--
-- Later migrations (20260212000001, 20260212000002, 20260222000002) ALTER
-- these tables and fail with "relation does not exist".
--
-- This repair uses IF NOT EXISTS / EXCEPTION handling so it is a no-op in
-- production where the tables already exist. In Preview, it creates the
-- tables with the full final schema (all columns from all migrations).
-- ============================================================================

-- 1. content_categories
CREATE TABLE IF NOT EXISTS public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. content_items (includes thumbnail_url from 20260212000002)
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  category_id UUID REFERENCES public.content_categories(id),
  content_type TEXT NOT NULL DEFAULT 'article',
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 5,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meta_description TEXT,
  meta_keywords TEXT[],
  sector_tags TEXT[],
  view_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. content_company_profiles (includes outcome from 20260212000001)
CREATE TABLE IF NOT EXISTS public.content_company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  website TEXT,
  origin_country TEXT,
  target_market TEXT,
  entry_date TEXT,
  monthly_revenue TEXT,
  annual_revenue TEXT,
  startup_costs TEXT,
  gross_margin TEXT,
  is_profitable BOOLEAN DEFAULT false,
  founder_count INTEGER DEFAULT 1,
  employee_count INTEGER DEFAULT 1,
  industry TEXT,
  business_model TEXT,
  outcome TEXT CHECK (outcome IN ('successful', 'unsuccessful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. content_founders
CREATE TABLE IF NOT EXISTS public.content_founders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. content_sections
CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. content_bodies
CREATE TABLE IF NOT EXISTS public.content_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.content_sections(id) ON DELETE CASCADE,
  question TEXT,
  body_text TEXT NOT NULL,
  body_markdown TEXT,
  sort_order INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'paragraph',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_bodies ENABLE ROW LEVEL SECURITY;

-- Re-create policies with exception handlers (no-op if they already exist)
DO $$ BEGIN
  CREATE POLICY "Public can view content categories"
    ON public.content_categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view published content"
    ON public.content_items FOR SELECT USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view company profiles"
    ON public.content_company_profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view founders"
    ON public.content_founders FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view content sections"
    ON public.content_sections FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view content bodies"
    ON public.content_bodies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Re-create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON public.content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_featured ON public.content_items(featured);
CREATE INDEX IF NOT EXISTS idx_content_items_sector_tags ON public.content_items USING GIN(sector_tags);
CREATE INDEX IF NOT EXISTS idx_content_company_profiles_content ON public.content_company_profiles(content_id);
CREATE INDEX IF NOT EXISTS idx_content_founders_content ON public.content_founders(content_id);
CREATE INDEX IF NOT EXISTS idx_content_sections_content ON public.content_sections(content_id);
CREATE INDEX IF NOT EXISTS idx_content_bodies_content ON public.content_bodies(content_id);
CREATE INDEX IF NOT EXISTS idx_content_bodies_section ON public.content_bodies(section_id);

-- Re-create updated_at triggers (safe if already exist)
DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_company_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_founders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.content_bodies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
