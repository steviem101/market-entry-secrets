-- DB-003: Add missing indexes for filtering and lookups

-- Slug indexes (already unique via constraints in previous migration)

-- Filterable column indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_location_id ON service_providers(location_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(investor_type);

-- GIN indexes for text array columns (fast array overlap queries)
CREATE INDEX IF NOT EXISTS idx_service_providers_services ON service_providers USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_community_members_specialties ON community_members USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_investors_sector_focus ON investors USING GIN(sector_focus);
CREATE INDEX IF NOT EXISTS idx_investors_stage_focus ON investors USING GIN(stage_focus);
CREATE INDEX IF NOT EXISTS idx_trade_agencies_sectors ON trade_investment_agencies USING GIN(sectors_supported);

-- Created_at DESC indexes for default sorting
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_publish_date ON content_items(publish_date DESC);
