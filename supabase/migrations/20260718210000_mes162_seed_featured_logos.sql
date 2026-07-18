-- MES-162 — seed the homepage LogoCloud with an owner-curated featured set.
--
-- The LogoCloud (src/components/sections/LogoCloud.tsx) renders organisations
-- flagged is_featured across the three public directories. Logo usage rights
-- for the 14 records below were confirmed by the owner (18 Jul); ~14 are
-- flagged so the strip reliably renders 8–12 after any Logo.dev coverage
-- misses (unresolved logos drop out client-side via onError).
--
-- Idempotent: pure boolean UPDATE keyed on stable slugs — re-running is a
-- no-op. Additive/reversible: only sets is_featured = true; set false to
-- remove a logo. Self-sufficient on preview replay: against an empty DB these
-- UPDATEs match zero rows and no-op (the directory data isn't seeded via
-- migrations). is_featured columns exist as of 20260718100000 (service_providers,
-- innovation_ecosystem) and pre-existed on trade_investment_agencies.

update public.service_providers
   set is_featured = true
 where slug in (
   'accenture-australia',
   'airwallex-pty-ltd',
   'allens',
   'bdo-australia-limited',
   'acclime',
   'bluerock'
 );

update public.trade_investment_agencies
   set is_featured = true
 where slug in (
   'austrade',
   'advantage-austria',
   'amcham-australia'
 );

update public.innovation_ecosystem
   set is_featured = true
 where slug in (
   'antler-australia',
   'ausbiotech',
   'australian-computer-society-acs',
   'australian-banking-association',
   'austmine'
 );
