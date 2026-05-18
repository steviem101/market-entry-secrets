-- Country page content tables to support the redesigned /countries/:slug template.
-- Pattern matches the investors directory migration: public SELECT, admin-only writes via has_role().

----------------------------------------------------------------------
-- 1. Per-country editorial copy (one row per country)
----------------------------------------------------------------------

CREATE TABLE public.country_page_content (
  country_id            uuid PRIMARY KEY REFERENCES public.countries(id) ON DELETE CASCADE,
  hero_headline         text NOT NULL,
  hero_subhead          text NOT NULL,
  hero_badge            text,
  hero_trust_companies  text[] DEFAULT '{}',
  hero_trust_extra      integer DEFAULT 0,
  narrative_bullets     jsonb NOT NULL DEFAULT '[]'::jsonb,
  differentiators       jsonb NOT NULL DEFAULT '[]'::jsonb,
  pull_quote            text,
  pull_quote_attr       text,
  live_snapshot         jsonb,
  featured_city_slugs   text[] DEFAULT '{}',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_page_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 2. Trade snapshot tiles (Section 2)
----------------------------------------------------------------------

CREATE TABLE public.country_trade_metrics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL,
  value       text NOT NULL,
  label       text NOT NULL,
  source      text NOT NULL,
  source_url  text,
  delta       text,
  positive    boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_country_trade_metrics_country ON public.country_trade_metrics(country_id, sort_order);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_trade_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 3. Case studies (Section 4)
-- FK to content_items because case studies live there (content_type='case_study').
----------------------------------------------------------------------

CREATE TABLE public.country_case_studies (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id       uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  sort_order       integer NOT NULL,
  company_name     text NOT NULL,
  sector           text NOT NULL,
  outcome          text NOT NULL,
  logo_color       text,
  wordmark         text,
  content_item_id  uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_country_case_studies_country ON public.country_case_studies(country_id, sort_order);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_case_studies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 4. Six-stage playbook (Section 6)
----------------------------------------------------------------------

CREATE TABLE public.country_playbook_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id    uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  stage_number  integer NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
  title         text NOT NULL,
  time_range    text NOT NULL,
  summary       text NOT NULL,
  sub_steps     text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (country_id, stage_number)
);

CREATE INDEX idx_country_playbook_country ON public.country_playbook_stages(country_id, stage_number);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_playbook_stages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 5. Funding instruments (Section 7) -- origin (IE) and destination (AU)
----------------------------------------------------------------------

CREATE TABLE public.country_funding_instruments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  side        text NOT NULL CHECK (side IN ('origin', 'destination')),
  sort_order  integer NOT NULL,
  title       text NOT NULL,
  body        text NOT NULL,
  tag         text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_country_funding_country_side ON public.country_funding_instruments(country_id, side, sort_order);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_funding_instruments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 6. FAQs (Section 10)
----------------------------------------------------------------------

CREATE TABLE public.country_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL,
  question    text NOT NULL,
  answer      text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_country_faqs_country ON public.country_faqs(country_id, sort_order);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_faqs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 7. RLS -- public read, admin write (matches investors / service_providers pattern)
----------------------------------------------------------------------

ALTER TABLE public.country_page_content        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_trade_metrics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_case_studies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_playbook_stages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_funding_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_faqs                ENABLE ROW LEVEL SECURITY;

-- country_page_content
CREATE POLICY "Anyone can read country_page_content"
  ON public.country_page_content FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_page_content"
  ON public.country_page_content FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_page_content"
  ON public.country_page_content FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_page_content"
  ON public.country_page_content FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- country_trade_metrics
CREATE POLICY "Anyone can read country_trade_metrics"
  ON public.country_trade_metrics FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_trade_metrics"
  ON public.country_trade_metrics FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_trade_metrics"
  ON public.country_trade_metrics FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_trade_metrics"
  ON public.country_trade_metrics FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- country_case_studies
CREATE POLICY "Anyone can read country_case_studies"
  ON public.country_case_studies FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_case_studies"
  ON public.country_case_studies FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_case_studies"
  ON public.country_case_studies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_case_studies"
  ON public.country_case_studies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- country_playbook_stages
CREATE POLICY "Anyone can read country_playbook_stages"
  ON public.country_playbook_stages FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_playbook_stages"
  ON public.country_playbook_stages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_playbook_stages"
  ON public.country_playbook_stages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_playbook_stages"
  ON public.country_playbook_stages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- country_funding_instruments
CREATE POLICY "Anyone can read country_funding_instruments"
  ON public.country_funding_instruments FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_funding_instruments"
  ON public.country_funding_instruments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_funding_instruments"
  ON public.country_funding_instruments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_funding_instruments"
  ON public.country_funding_instruments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- country_faqs
CREATE POLICY "Anyone can read country_faqs"
  ON public.country_faqs FOR SELECT USING (true);
CREATE POLICY "Only admins can insert country_faqs"
  ON public.country_faqs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_faqs"
  ON public.country_faqs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_faqs"
  ON public.country_faqs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
