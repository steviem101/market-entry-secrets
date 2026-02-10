-- ============================================================================
-- Create manually-created tables that have no migration
-- ============================================================================
-- These tables were created on production via dashboard/Lovable but never
-- captured in a migration file. Later migrations INSERT/ALTER/POLICY them.
-- ============================================================================

-- ============================================
-- community_members (needed by 20250615023358 INSERT, 20250622032345 ALTER)
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  experience text NOT NULL,
  specialties text[] DEFAULT '{}',
  website text,
  contact text,
  company text,
  image text,
  is_anonymous boolean NOT NULL DEFAULT false,
  experience_tiles jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view community members"
    ON public.community_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- market_entry_reports (needed by 20251012093622 POLICY, 20251012093808 ALTER)
-- ============================================
CREATE TABLE IF NOT EXISTS public.market_entry_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  report_type text NOT NULL DEFAULT 'market_analysis',
  status text NOT NULL DEFAULT 'pending',
  file_url text,
  delivered_at timestamp with time zone,
  created_by_team_member text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.market_entry_reports ENABLE ROW LEVEL SECURITY;
