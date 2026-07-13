-- MES-148 Phase 5 (P5-1): service_terms — canonical service/specialty vocabulary
-- with synonyms, so directory matching stops missing rows whose free-text service
-- tag differs from the intake goal's tag.
--
-- The problem (measured 2026-07-13): directory service tags are fragmented free
-- text. The intake goal "find_providers" expands to ["Legal","Tax","HR",...], but
-- service_providers.services rows say "Legal Services" (8), "Tax & Legal", "Employment
-- Law", "HR / Talent", "Banking and Finance", "Talent Acquisition" — so the exact
-- `.cs.{Legal}` arm matches only 2 of the real legal providers. This table maps each
-- canonical term to the REAL directory-cased variants; generate-report expands a
-- goal tag into its synonyms before matching (additive superset — only ADDS matching
-- variants, never removes), behind the SERVICE_TERMS_ENABLED flag.
--
-- Reference/taxonomy data (sits beside sectors / sector_vocabulary): additive +
-- reversible (drop the table). RLS on, public SELECT (non-sensitive category names),
-- writes service-role only.

create table if not exists public.service_terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                       -- canonical id, e.g. 'legal'
  label text not null,                             -- display form, e.g. 'Legal'
  category text,                                   -- optional grouping
  -- Real directory-cased variants that mean this term (INCLUDING the goal-tag form
  -- and the label). Matching is case-sensitive on the array, so casing must match
  -- the directory; lookup by the expander is case-insensitive.
  synonyms text[] not null default '{}',
  -- Optional hint for which directory axis this term applies to (services /
  -- specialties). Informational for now; not enforced.
  applies_to text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.service_terms is
  'MES-148 Phase 5: canonical service/specialty vocabulary + real directory-cased synonyms. Kills the dead-tag under-match by expanding goal tags to synonyms at match time.';

-- (slug already has a unique index from the UNIQUE constraint — no extra index needed.)

alter table public.service_terms enable row level security;
revoke all on table public.service_terms from anon, authenticated;
grant select on table public.service_terms to anon, authenticated;

drop policy if exists "Service terms are publicly readable" on public.service_terms;
create policy "Service terms are publicly readable"
  on public.service_terms for select
  using (true);

-- ── Seed (idempotent) ────────────────────────────────────────────────────────
-- Canonical terms behind the intake goal tags, each with the REAL directory-cased
-- variants observed in service_providers.services / community_members.specialties.
-- Only ADDITIVE at match time, so an over-broad synonym can add a candidate but the
-- in-memory scorer still ranks; curated conservatively. Re-runnable (on conflict).
insert into public.service_terms (slug, label, category, synonyms, applies_to) values
  ('legal', 'Legal', 'professional_services',
   array['Legal','Legal Services','Tax & Legal','Employment Law','Dispute Resolution','Corporate Governance','Regulatory Affairs','Intellectual Property','Compliance','Regulatory'], array['services']),
  ('tax', 'Tax', 'professional_services',
   array['Tax','Tax & Legal','Accounting / Tax','R&D Tax Incentives'], array['services','specialties']),
  ('accounting', 'Accounting', 'professional_services',
   array['Accounting','Audit & Assurance','Accounting / Tax','Financial Modelling'], array['services','specialties']),
  ('finance', 'Finance', 'professional_services',
   array['Finance','Banking and Finance','Wealth Management','Corporate Cards','Financial Modelling','Fundraising / Investment'], array['services','specialties']),
  ('hr', 'HR', 'professional_services',
   array['HR','HR / Talent','Talent Acquisition','Executive Search','SaaS Talent','Global Mobility'], array['services','specialties']),
  ('immigration', 'Immigration', 'professional_services',
   array['Immigration','Employer Sponsored Visas','Tech Visas & Immigration','Immigration / Visa / Mobility','Global Mobility','Soft Landing'], array['services','specialties']),
  ('consulting', 'Consulting', 'advisory',
   array['Consulting','Advisory','Corporate Advisory','Mentoring & Advisory','Strategic Planning'], array['services','specialties']),
  ('market_research', 'Market Research', 'advisory',
   array['Market Research','Market Research / Strategy','Market Validation','Strategic Planning'], array['services','specialties']),
  ('marketing', 'Marketing', 'growth',
   array['Marketing','Digital Marketing','Media Training'], array['services']),
  ('sales', 'Sales', 'growth',
   array['Sales','Sales / GTM','Sales as a Service','GTM & Tech Sales'], array['services','specialties']),
  ('trade_advisory', 'Trade Advisory', 'government',
   array['Trade Advisory','Trade & Government','International Trade Advisory','Trade Promotion','Government Relations','Advocacy','Stakeholder Engagement'], array['services','specialties']),
  ('government_relations', 'Government Relations', 'government',
   array['Government Relations','Advocacy','Stakeholder Engagement','Corporate Governance'], array['services']),
  ('investment', 'Investment', 'capital',
   array['Investment','Venture Capital','Funding','Fundraising / Investment','Investor Relations','Investment Strategy','Mergers and Acquisitions','M&A Advisory','Corporate Advisory'], array['services','specialties']),
  ('mentorship', 'Mentorship', 'advisory',
   array['Mentorship','Advisory','Active Advisor','Startup Advisor','Mentoring & Advisory','Scaled Founder'], array['specialties'])
on conflict (slug) do update
  set label = excluded.label,
      category = excluded.category,
      synonyms = excluded.synonyms,
      applies_to = excluded.applies_to,
      updated_at = now();
