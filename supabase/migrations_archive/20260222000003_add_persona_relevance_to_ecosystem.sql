-- Migration 003: Add persona relevance tags to ecosystem/directory tables
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS serves_personas text[] DEFAULT '{}';

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS serves_personas text[] DEFAULT '{}';

ALTER TABLE public.innovation_ecosystem
  ADD COLUMN IF NOT EXISTS serves_personas text[] DEFAULT '{}';

ALTER TABLE public.trade_investment_agencies
  ADD COLUMN IF NOT EXISTS serves_personas text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_service_providers_personas
  ON public.service_providers USING GIN (serves_personas);
CREATE INDEX IF NOT EXISTS idx_community_members_personas
  ON public.community_members USING GIN (serves_personas);
CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_personas
  ON public.innovation_ecosystem USING GIN (serves_personas);
CREATE INDEX IF NOT EXISTS idx_trade_agencies_personas
  ON public.trade_investment_agencies USING GIN (serves_personas);
