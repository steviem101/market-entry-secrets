-- Migration: Add nullable location_id FK to directory tables
-- Enables relational filtering of directory entities by location

-- service_providers
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_service_providers_location_id ON public.service_providers(location_id);

-- community_members
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_community_members_location_id ON public.community_members(location_id);

-- events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_location_id ON public.events(location_id);

-- innovation_ecosystem
ALTER TABLE public.innovation_ecosystem
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_location_id ON public.innovation_ecosystem(location_id);

-- trade_investment_agencies
ALTER TABLE public.trade_investment_agencies
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_trade_investment_agencies_location_id ON public.trade_investment_agencies(location_id);
