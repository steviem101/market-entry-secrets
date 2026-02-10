
-- Update the Distribution Strategy Best Practices for Australia content with comprehensive sections and body text
-- Wrapped in DO block to skip gracefully if content_sections table doesn't exist (already applied or schema differs)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_sections') THEN
    RAISE NOTICE 'content_sections table does not exist, skipping migration';
    RETURN;
  END IF;

  -- First, let's add the main sections for this content item
  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Market Overview', 'market-overview', 1, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Distribution Channel Types', 'distribution-channel-types', 2, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'State-by-State Considerations', 'state-by-state-considerations', 3, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Regulatory Requirements', 'regulatory-requirements', 4, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Technology and E-commerce', 'technology-and-ecommerce', 5, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Case Studies', 'case-studies', 6, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active)
  SELECT ci.id, 'Implementation Strategy', 'implementation-strategy', 7, true
  FROM content_items ci WHERE ci.slug = 'distribution-strategy-australia'
  ON CONFLICT (content_item_id, slug) DO NOTHING;

  -- Now add the detailed body content for each section
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_bodies') THEN
    RAISE NOTICE 'content_bodies table does not exist, skipping body content';
    RETURN;
  END IF;

  -- Market Overview Section
  INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
  SELECT cs.id, 'Understanding the Australian Market Landscape',
    '<p>Australia presents a unique distribution landscape characterized by geographic concentration and market sophistication.</p>',
    1, 'text'
  FROM content_sections cs JOIN content_items ci ON cs.content_item_id = ci.id
  WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'market-overview'
  ON CONFLICT (section_id, sort_order) DO NOTHING;

END $$;

-- Update the main content item with enhanced metadata (safe even if table exists without the row)
UPDATE content_items
SET
  subtitle = 'A comprehensive guide to building successful distribution networks across Australia, covering traditional retail, e-commerce, and omnichannel strategies.',
  read_time = 12,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'distribution-strategy-australia';
