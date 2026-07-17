-- MES-182 Phase B: guide topic taxonomy.
-- Additive only: a nullable guide_topic column on content_items, a CHECK
-- constraint pinning the 8-slug vocabulary, and a slug-keyed fill-only-empty
-- backfill of the 44 published guides per the approved mapping in
-- docs/audits/mes-182-guide-topic-taxonomy-audit.md (§5).
-- Preview-safe + idempotent: IF NOT EXISTS guards; the backfill writes only
-- CHECK-valid values into a nullable column, latches on guide_topic IS NULL,
-- and no-ops against an empty preview DB. No grant/RLS changes.

ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS guide_topic text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_items_guide_topic_check'
      AND conrelid = 'public.content_items'::regclass
  ) THEN
    ALTER TABLE public.content_items
      ADD CONSTRAINT content_items_guide_topic_check CHECK (
        guide_topic IS NULL OR guide_topic IN (
          'registration-structure',
          'tax-finance',
          'employment-visas',
          'ip-legal',
          'regulation-compliance',
          'funding-grants-equity',
          'strategy-gtm',
          'sector-corridor-playbooks'
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.content_items.guide_topic IS
  'MES-182 guide topic slug (guides only; NULL = no topic, reachable via "All Topics"). Vocabulary mirrored in src/lib/guideTopics.ts.';

UPDATE public.content_items AS ci
SET guide_topic = m.topic
FROM (VALUES
  ('australian-business-registration-guide',        'registration-structure'),
  ('foreign-company-setup-anz',                     'registration-structure'),
  ('entry-structure-subsidiary-branch-distributor', 'registration-structure'),
  ('au-startup-structure-company-trust',            'registration-structure'),
  ('australian-tax-obligations-guide',              'tax-finance'),
  ('cross-border-pricing-billing-gst-anz',          'tax-finance'),
  ('au-gst-bas-bookkeeping-startups',               'tax-finance'),
  ('business-banking-payments-anz',                 'tax-finance'),
  ('employment-payroll-superannuation-anz',         'employment-visas'),
  ('talent-visa-sponsorship-anz',                   'employment-visas'),
  ('au-first-employees-payg-super-fairwork',        'employment-visas'),
  ('au-startup-ip-trademarks-patents',              'ip-legal'),
  ('au-cofounder-agreements-founding-team',         'ip-legal'),
  ('firb-foreign-investment-approval-anz',          'regulation-compliance'),
  ('australia-market-entry-regulatory-compliance',  'regulation-compliance'),
  ('data-residency-privacy-act-anz',                'regulation-compliance'),
  ('government-enterprise-procurement-anz',         'regulation-compliance'),
  ('au-startup-fundraising-safe-esic',              'funding-grants-equity'),
  ('au-employee-share-option-plan-esop',            'funding-grants-equity'),
  ('au-startup-grants-government-support',          'funding-grants-equity'),
  ('au-rd-tax-incentive-rdti',                      'funding-grants-equity'),
  ('how-to-choose-market-entry-strategy-australia', 'strategy-gtm'),
  ('how-to-choose-target-market-australia-nz',      'strategy-gtm'),
  ('distributor-vs-direct-entry-australia',         'strategy-gtm'),
  ('control-vs-flexibility-market-entry-anz',       'strategy-gtm'),
  ('how-long-market-entry-australia-takes',         'strategy-gtm'),
  ('cost-of-entering-australian-market',            'strategy-gtm'),
  ('australia-market-entry-risks-mitigation',       'strategy-gtm'),
  ('competitor-analysis-australian-market',         'strategy-gtm'),
  ('localising-product-pricing-marketing-australia','strategy-gtm'),
  ('au-startup-go-to-market-first-customers',       'strategy-gtm'),
  ('market-entry-services-australia-guide',         'strategy-gtm'),
  ('fintech-market-entry-anz',                      'sector-corridor-playbooks'),
  ('regtech-identity-verification-anz',             'sector-corridor-playbooks'),
  ('saas-go-to-market-anz',                         'sector-corridor-playbooks'),
  ('cybersecurity-market-entry-anz',                'sector-corridor-playbooks'),
  ('retail-qsr-market-entry-anz',                   'sector-corridor-playbooks'),
  ('healthtech-medtech-market-entry-anz',           'sector-corridor-playbooks'),
  ('ai-data-platform-market-entry-anz',             'sector-corridor-playbooks'),
  ('cleantech-energy-market-entry-anz',             'sector-corridor-playbooks'),
  ('edtech-training-market-entry-anz',              'sector-corridor-playbooks'),
  ('irish-tech-founders-guide-anz-expansion',       'sector-corridor-playbooks'),
  ('india-to-anz-market-entry',                     'sector-corridor-playbooks'),
  ('canada-to-anz-market-entry',                    'sector-corridor-playbooks')
) AS m(slug, topic)
WHERE ci.slug = m.slug
  AND ci.content_type = 'guide'
  AND ci.guide_topic IS NULL;
