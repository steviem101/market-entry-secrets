
-- ============================================
-- Table 1: user_intake_forms
-- ============================================
CREATE TABLE public.user_intake_forms (
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

-- Users can insert their own intake forms
CREATE POLICY "Users can insert own intake forms"
  ON public.user_intake_forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own intake forms
CREATE POLICY "Users can view own intake forms"
  ON public.user_intake_forms FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Users can update their own intake forms
CREATE POLICY "Users can update own intake forms"
  ON public.user_intake_forms FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_intake_forms_updated_at
  BEFORE UPDATE ON public.user_intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Table 2: user_reports
-- ============================================
CREATE TABLE public.user_reports (
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

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.user_reports FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Users can update feedback on their own reports
CREATE POLICY "Users can update own report feedback"
  ON public.user_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role inserts reports (edge functions)
CREATE POLICY "Service can insert reports"
  ON public.user_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_reports_updated_at
  BEFORE UPDATE ON public.user_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Table 3: report_templates
-- ============================================
CREATE TABLE public.report_templates (
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

-- All authenticated users can read templates
CREATE POLICY "Authenticated users can view templates"
  ON public.report_templates FOR SELECT
  USING (true);

-- Only admins can manage templates
CREATE POLICY "Admins can insert templates"
  ON public.report_templates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates"
  ON public.report_templates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
  ON public.report_templates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Seed report_templates with 7 section prompts
-- ============================================
INSERT INTO public.report_templates (section_name, prompt_body, variables, visibility_tier, version) VALUES
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
);
