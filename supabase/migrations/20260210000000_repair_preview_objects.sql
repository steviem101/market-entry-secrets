-- ============================================================================
-- REPAIR MIGRATION: Recreate objects that fail in Supabase Preview
-- ============================================================================
-- Two earlier migrations (20250621012036, 20250621015154) create triggers on
-- auth.users which can fail in Preview, rolling back ALL objects in those
-- transactions (profiles, user_roles, has_role, user_subscriptions, etc).
-- This cascades to 9+ downstream migrations.
--
-- This NEW migration file recreates everything using IF NOT EXISTS / EXCEPTION
-- handling so it is safe whether the originals succeeded or not.
-- ============================================================================

-- ============================================
-- FROM: 20250621012036 (profiles, user_roles, has_role)
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  username text UNIQUE,
  avatar_url text,
  bio text,
  website text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for profiles
DO $$ BEGIN
  CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies for user_roles
DO $$ BEGIN
  CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

-- Auth trigger (safe to fail)
DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create on_auth_user_created trigger: %', SQLERRM;
END $$;

-- Updated_at trigger for profiles
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================
-- FROM: 20250621015154 (user_subscriptions, subscription_tier)
-- ============================================

-- Create subscription_tier enum
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'concierge');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_usage table
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
DO $$ BEGIN
  CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies for user_usage
DO $$ BEGIN
  CREATE POLICY "Anyone can insert usage tracking" ON public.user_usage FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own usage" ON public.user_usage FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create subscription trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

-- Auth trigger (safe to fail)
DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create on_auth_user_created_subscription trigger: %', SQLERRM;
END $$;

-- Updated_at trigger for user_subscriptions
DO $$ BEGIN
  CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================
-- FROM: 20250918171932 (unique constraint)
-- ============================================
DO $$ BEGIN
  ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================
-- FROM: 20250918173540 (subscription tier values)
-- ============================================
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'growth';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'scale';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'enterprise';


-- ============================================
-- FROM: 20250930154728 (stripe_customer_id on profiles)
-- ============================================
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

DO $$ BEGIN
  COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID linking this user to their Stripe account';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================
-- FROM: 20260206223728 (user_intake_forms, user_reports, report_templates)
-- ============================================

-- Create user_intake_forms
CREATE TABLE IF NOT EXISTS public.user_intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website_url text NOT NULL,
  country_of_origin text NOT NULL,
  industry_sector text NOT NULL,
  company_stage text NOT NULL,
  employee_count text NOT NULL,
  target_regions text[] NOT NULL DEFAULT '{}',
  services_needed text[] NOT NULL DEFAULT '{}',
  timeline text NOT NULL,
  budget_level text NOT NULL,
  primary_goals text,
  key_challenges text,
  raw_input jsonb NOT NULL DEFAULT '{}',
  enriched_input jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_intake_forms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can insert own intake forms" ON public.user_intake_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own intake forms" ON public.user_intake_forms FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own intake forms" ON public.user_intake_forms FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_user_intake_forms_updated_at BEFORE UPDATE ON public.user_intake_forms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create user_reports
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_form_id uuid REFERENCES public.user_intake_forms(id) ON DELETE CASCADE,
  tier_at_generation text NOT NULL DEFAULT 'free',
  report_json jsonb NOT NULL DEFAULT '{}',
  sections_generated text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  feedback_score integer,
  feedback_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own reports" ON public.user_reports FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own report feedback" ON public.user_reports FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can insert reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_user_reports_updated_at BEFORE UPDATE ON public.user_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create report_templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  prompt_body text NOT NULL,
  variables text[] NOT NULL DEFAULT '{}',
  visibility_tier text NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view templates" ON public.report_templates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert templates" ON public.report_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update templates" ON public.report_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete templates" ON public.report_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Seed report_templates (only if empty)
INSERT INTO public.report_templates (section_name, prompt_body, variables, visibility_tier, version)
SELECT * FROM (VALUES
(
  'executive_summary',
  'You are Market Entry Secrets AI, an expert on international companies entering the Australian and ANZ market. Generate a concise executive summary (300 words max) for a {{company_stage}} {{industry_sector}} company called "{{company_name}}" from {{country_of_origin}} entering the Australian market targeting {{target_regions}}.

Company context: {{enriched_summary}}
Goals: {{primary_goals}}
Challenges: {{key_challenges}}
Timeline: {{timeline}}
Budget: {{budget_level}}

Include: key market opportunity, recommended approach, and expected timeline. Be specific and actionable. Write in a professional consulting tone.',
  ARRAY['company_stage','industry_sector','company_name','country_of_origin','target_regions','enriched_summary','primary_goals','key_challenges','timeline','budget_level'],
  'free',
  1
),
(
  'swot_analysis',
  'Generate a SWOT analysis for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering Australia targeting {{target_regions}}.

Company context: {{enriched_summary}}

Strengths: based on company context and capabilities.
Weaknesses: common challenges for {{country_of_origin}} companies in {{industry_sector}}.
Opportunities: based on the Australian {{industry_sector}} market landscape.
Threats: regulatory, competitive, and cultural factors.

Format as 4 sections with 3-4 bullet points each. Be specific to the company and market.',
  ARRAY['company_name','company_stage','industry_sector','country_of_origin','target_regions','enriched_summary'],
  'growth',
  1
),
(
  'service_providers',
  'Based on the following matched service providers from our vetted directory:

{{matched_providers_json}}

Write a brief recommendation paragraph for each provider, explaining why they are relevant to {{company_name}}''s market entry needs. The company needs these services: {{services_needed}}.

For each provider include: provider name, their category/speciality, and a 2-sentence recommendation explaining relevance. Format as a numbered list.',
  ARRAY['matched_providers_json','company_name','services_needed'],
  'free',
  1
),
(
  'mentor_recommendations',
  'Based on these matched mentors and community experts from our network:

{{matched_mentors_json}}

Write a recommendation for each mentor, explaining their relevance to {{company_name}}, a {{industry_sector}} company from {{country_of_origin}} entering {{target_regions}}.

Include their expertise area, location, and why the user should connect with them. Format as a numbered list with name, expertise, and recommendation.',
  ARRAY['matched_mentors_json','company_name','industry_sector','country_of_origin','target_regions'],
  'growth',
  1
),
(
  'events_resources',
  'Based on these upcoming events and content resources:

Events: {{matched_events_json}}
Content/Guides: {{matched_content_json}}

Curate a "Next Steps" section for {{company_name}} ({{industry_sector}}, targeting {{target_regions}}) with:
1. Recommended events to attend with brief explanation of relevance
2. Guides and case studies to read with brief explanation of relevance

Format with clear headers for Events and Resources sections.',
  ARRAY['matched_events_json','matched_content_json','company_name','industry_sector','target_regions'],
  'free',
  1
),
(
  'action_plan',
  'Create a phased action plan for {{company_name}} to enter Australia within their {{timeline}} timeline on a {{budget_level}} budget.

Company: {{company_stage}} {{industry_sector}} from {{country_of_origin}}, targeting {{target_regions}}.
Services needed: {{services_needed}}
Goals: {{primary_goals}}

Phase 1 - Foundation (Month 1-2): Legal entity setup, banking, compliance, visa requirements.
Phase 2 - Establish (Month 2-4): Office space, initial team, partnerships, local network.
Phase 3 - Launch (Month 4-6): Go-to-market strategy, lead generation, PR, growth.

Include specific next steps. Reference the matched service providers where relevant: {{matched_providers_summary}}. Be specific and actionable.',
  ARRAY['company_name','timeline','budget_level','company_stage','industry_sector','country_of_origin','target_regions','services_needed','primary_goals','matched_providers_summary'],
  'free',
  1
),
(
  'lead_list',
  'Based on these matched leads and market data from our database:

{{matched_leads_json}}

Create a curated lead list summary for {{company_name}} ({{industry_sector}}) entering {{target_regions}}. For each lead/dataset:
- Name and category
- Why it is relevant to the company''s market entry
- Recommended next step

Also suggest 2-3 additional lead generation strategies specific to {{industry_sector}} in Australia.',
  ARRAY['matched_leads_json','company_name','industry_sector','target_regions'],
  'scale',
  1
)
) AS t(section_name, prompt_body, variables, visibility_tier, version)
WHERE NOT EXISTS (SELECT 1 FROM public.report_templates LIMIT 1);


-- ============================================
-- FROM: 20260208081954 (share_token on user_reports)
-- ============================================
DO $$ BEGIN
  ALTER TABLE public.user_reports ADD COLUMN share_token uuid DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reports_share_token ON public.user_reports (share_token) WHERE share_token IS NOT NULL;

DO $$ BEGIN
  CREATE POLICY "Anyone can view shared reports via token" ON public.user_reports FOR SELECT USING (share_token IS NOT NULL AND share_token = share_token);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
