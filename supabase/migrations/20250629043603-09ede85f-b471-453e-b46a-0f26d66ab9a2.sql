
-- First, let's check if the content item exists and get its ID
DO $$
DECLARE
    content_item_id uuid;
    section_count integer;
BEGIN
    -- Get the content item ID for distribution-strategy-australia
    SELECT id INTO content_item_id
    FROM content_items 
    WHERE slug = 'distribution-strategy-australia';
    
    IF content_item_id IS NULL THEN
        RAISE NOTICE 'Content item with slug distribution-strategy-australia not found. Creating it first.';
        
        -- Create the content item if it doesn't exist
        INSERT INTO content_items (
            title, 
            slug, 
            subtitle,
            content_type,
            status,
            read_time,
            publish_date
        ) VALUES (
            'Distribution Strategy Best Practices for Australia',
            'distribution-strategy-australia',
            'A comprehensive guide to building successful distribution networks across Australia, covering traditional retail, e-commerce, and omnichannel strategies.',
            'article',
            'published',
            12,
            CURRENT_TIMESTAMP
        )
        RETURNING id INTO content_item_id;
    END IF;

    -- Check if sections already exist
    SELECT COUNT(*) INTO section_count
    FROM content_sections 
    WHERE content_id = content_item_id;

    -- Only add sections if they don't exist
    IF section_count = 0 THEN
        INSERT INTO content_sections (content_id, title, slug, sort_order, is_active) VALUES
        (content_item_id, 'Market Overview', 'market-overview', 1, true),
        (content_item_id, 'Distribution Channel Types', 'distribution-channel-types', 2, true),
        (content_item_id, 'State-by-State Considerations', 'state-by-state-considerations', 3, true),
        (content_item_id, 'Regulatory Requirements', 'regulatory-requirements', 4, true),
        (content_item_id, 'Technology and E-commerce', 'technology-and-ecommerce', 5, true),
        (content_item_id, 'Case Studies', 'case-studies', 6, true),
        (content_item_id, 'Implementation Strategy', 'implementation-strategy', 7, true);
    END IF;

    -- Add comprehensive body content for Market Overview section
    INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
    SELECT 
      cs.id,
      'Understanding the Australian Market Landscape',
      '<p>Australia presents a unique distribution landscape characterized by geographic concentration and market sophistication. With over 85% of the population living in urban areas, particularly along the eastern seaboard, businesses must understand the concentrated nature of Australian consumer markets.</p>

<p>The Australian retail market is valued at over AUD $400 billion annually, with e-commerce representing approximately 12% of total retail sales and growing at 15% year-over-year. Key market characteristics include:</p>

<ul>
<li><strong>Geographic Concentration:</strong> Sydney, Melbourne, Brisbane, Perth, and Adelaide account for 70% of total consumer spending</li>
<li><strong>High Consumer Expectations:</strong> Australian consumers expect premium service levels and convenient delivery options</li>
<li><strong>Seasonal Variations:</strong> Southern hemisphere seasons impact demand patterns, particularly for seasonal products</li>
<li><strong>Remote Area Challenges:</strong> Serving rural and remote communities requires specialized logistics solutions</li>
</ul>',
      1,
      'text'
    FROM content_sections cs
    JOIN content_items ci ON cs.content_id = ci.id
    WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'market-overview'
    AND NOT EXISTS (
        SELECT 1 FROM content_bodies cb 
        WHERE cb.section_id = cs.id AND cb.sort_order = 1
    );

    -- Add Distribution Channel Types content
    INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
    SELECT 
      cs.id,
      'Traditional Retail Channels',
      '<p>Traditional retail remains a cornerstone of Australian distribution, with several key channel types dominating the landscape:</p>

<h4>Major Retail Chains</h4>
<ul>
<li><strong>Woolworths and Coles:</strong> Duopoly controlling ~70% of grocery market</li>
<li><strong>Bunnings Warehouse:</strong> Dominant in hardware and home improvement</li>
<li><strong>JB Hi-Fi:</strong> Leading electronics and entertainment retailer</li>
<li><strong>Harvey Norman:</strong> Major furniture and electronics chain</li>
</ul>

<h4>Department Stores</h4>
<ul>
<li><strong>Myer and David Jones:</strong> Premium department store positioning</li>
<li><strong>Target and Kmart:</strong> Mass market discount retailers</li>
<li><strong>Big W:</strong> Woolworths-owned discount department store</li>
</ul>

<p>Success in traditional retail requires understanding buyer preferences, seasonal planning cycles, and the importance of in-store merchandising and promotional support.</p>',
      1,
      'text'
    FROM content_sections cs
    JOIN content_items ci ON cs.content_id = ci.id
    WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'distribution-channel-types'
    AND NOT EXISTS (
        SELECT 1 FROM content_bodies cb 
        WHERE cb.section_id = cs.id AND cb.sort_order = 1
    );

    -- Add E-commerce content
    INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
    SELECT 
      cs.id,
      'E-commerce and Digital Channels',
      '<p>Digital distribution channels are rapidly evolving in Australia, presenting significant opportunities for businesses of all sizes:</p>

<h4>Marketplace Platforms</h4>
<ul>
<li><strong>Amazon Australia:</strong> Launched 2017, rapid growth in electronics and books</li>
<li><strong>eBay Australia:</strong> Established marketplace with strong C2C and B2C presence</li>
<li><strong>Catch.com.au:</strong> Acquired by Wesfarmers, daily deals focus</li>
<li><strong>Kogan:</strong> Australian-founded online marketplace</li>
</ul>

<h4>Direct-to-Consumer (D2C)</h4>
<p>Building your own e-commerce presence offers greater control and higher margins. Key considerations include:</p>
<ul>
<li>Mobile-first design (45% of traffic is mobile)</li>
<li>Integration with Australian payment systems (PayPal, Afterpay, Zip)</li>
<li>Local hosting for faster load times</li>
<li>Australian-specific shipping and returns policies</li>
</ul>',
      2,
      'text'
    FROM content_sections cs
    JOIN content_items ci ON cs.content_id = ci.id
    WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'distribution-channel-types'
    AND NOT EXISTS (
        SELECT 1 FROM content_bodies cb 
        WHERE cb.section_id = cs.id AND cb.sort_order = 2
    );

    -- Add State-by-State content
    INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
    SELECT 
      cs.id,
      'New South Wales and Victoria: The Economic Powerhouses',
      '<p>These two states represent 58% of the Australian population and over 60% of economic activity:</p>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
<div style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem;">
<h4><strong>New South Wales</strong></h4>
<ul>
<li>Population: 8.2 million (32% of Australia)</li>
<li>GDP: AUD $650 billion</li>
<li>Key Cities: Sydney, Newcastle, Wollongong</li>
<li>Distribution Hubs: Sydney, Erskine Park</li>
</ul>
</div>

<div style="background: #faf5ff; padding: 1rem; border-radius: 0.5rem;">
<h4><strong>Victoria</strong></h4>
<ul>
<li>Population: 6.7 million (26% of Australia)</li>
<li>GDP: AUD $500 billion</li>
<li>Key Cities: Melbourne, Geelong, Ballarat</li>
<li>Distribution Hubs: Melbourne, Dandenong South</li>
</ul>
</div>
</div>

<p>Key distribution strategies include:</p>
<ul>
<li><strong>Primary Distribution Centers:</strong> Establish major warehouses in Sydney and Melbourne metro areas</li>
<li><strong>Same-Day Delivery:</strong> Essential for competing in these markets</li>
<li><strong>Transport Links:</strong> Leverage the Sydney-Melbourne freight corridor</li>
<li><strong>Premium Services:</strong> Higher income levels support premium delivery options</li>
</ul>',
      1,
      'text'
    FROM content_sections cs
    JOIN content_items ci ON cs.content_id = ci.id
    WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'state-by-state-considerations'
    AND NOT EXISTS (
        SELECT 1 FROM content_bodies cb 
        WHERE cb.section_id = cs.id AND cb.sort_order = 1
    );

    RAISE NOTICE 'Content successfully added for distribution-strategy-australia';
END $$;
