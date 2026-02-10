
-- Update the Distribution Strategy Best Practices for Australia content with comprehensive sections and body text

-- First, let's add the main sections for this content item
INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Market Overview',
  'market-overview',
  1,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Distribution Channel Types',
  'distribution-channel-types',
  2,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'State-by-State Considerations',
  'state-by-state-considerations',
  3,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Regulatory Requirements',
  'regulatory-requirements',
  4,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Technology and E-commerce',
  'technology-and-ecommerce',
  5,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Case Studies',
  'case-studies',
  6,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

INSERT INTO content_sections (content_item_id, title, slug, sort_order, is_active) 
SELECT 
  ci.id,
  'Implementation Strategy',
  'implementation-strategy',
  7,
  true
FROM content_items ci 
WHERE ci.slug = 'distribution-strategy-australia'
ON CONFLICT (content_item_id, slug) DO NOTHING;

-- Now add the detailed body content for each section
-- Market Overview Section
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
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'market-overview'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Key Market Statistics and Trends',
  '<p>Understanding current market dynamics is crucial for distribution success:</p>

<div class="bg-blue-50 p-6 rounded-lg mb-6">
<h4 class="font-semibold mb-3">Market Statistics 2024:</h4>
<ul class="space-y-2">
<li>• Total addressable market: AUD $400+ billion</li>
<li>• E-commerce growth rate: 15% annually</li>
<li>• Same-day delivery expectation: 65% of urban consumers</li>
<li>• Mobile commerce: 45% of online purchases</li>
<li>• Cross-border purchases: 25% of consumers buy internationally</li>
</ul>
</div>

<p>Emerging trends shaping distribution strategies include the rise of omnichannel retail, increased demand for sustainable delivery options, and the growing importance of last-mile logistics optimization.</p>',
  2,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'market-overview'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Distribution Channel Types Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Traditional Retail Channels',
  '<p>Traditional retail remains a cornerstone of Australian distribution, with several key channel types dominating the landscape:</p>

<h4 class="font-semibold mt-6 mb-3">Major Retail Chains</h4>
<ul class="mb-4">
<li><strong>Woolworths and Coles:</strong> Duopoly controlling ~70% of grocery market</li>
<li><strong>Bunnings Warehouse:</strong> Dominant in hardware and home improvement</li>
<li><strong>JB Hi-Fi:</strong> Leading electronics and entertainment retailer</li>
<li><strong>Harvey Norman:</strong> Major furniture and electronics chain</li>
</ul>

<h4 class="font-semibold mt-6 mb-3">Department Stores</h4>
<ul class="mb-4">
<li><strong>Myer and David Jones:</strong> Premium department store positioning</li>
<li><strong>Target and Kmart:</strong> Mass market discount retailers</li>
<li><strong>Big W:</strong> Woolworths-owned discount department store</li>
</ul>

<p>Success in traditional retail requires understanding buyer preferences, seasonal planning cycles, and the importance of in-store merchandising and promotional support.</p>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'distribution-channel-types'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'E-commerce and Digital Channels',
  '<p>Digital distribution channels are rapidly evolving in Australia, presenting significant opportunities for businesses of all sizes:</p>

<h4 class="font-semibold mt-6 mb-3">Marketplace Platforms</h4>
<div class="bg-green-50 p-4 rounded-lg mb-4">
<ul>
<li><strong>Amazon Australia:</strong> Launched 2017, rapid growth in electronics and books</li>
<li><strong>eBay Australia:</strong> Established marketplace with strong C2C and B2C presence</li>
<li><strong>Catch.com.au:</strong> Acquired by Wesfarmers, daily deals focus</li>
<li><strong>Kogan:</strong> Australian-founded online marketplace</li>
</ul>
</div>

<h4 class="font-semibold mt-6 mb-3">Direct-to-Consumer (D2C)</h4>
<p>Building your own e-commerce presence offers greater control and higher margins. Key considerations include:</p>
<ul class="mb-4">
<li>Mobile-first design (45% of traffic is mobile)</li>
<li>Integration with Australian payment systems (PayPal, Afterpay, Zip)</li>
<li>Local hosting for faster load times</li>
<li>Australian-specific shipping and returns policies</li>
</ul>

<h4 class="font-semibold mt-6 mb-3">Social Commerce</h4>
<p>Instagram Shopping, Facebook Marketplace, and TikTok Shop are emerging channels, particularly effective for reaching younger demographics and lifestyle products.</p>',
  2,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'distribution-channel-types'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- State-by-State Considerations Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'New South Wales and Victoria: The Economic Powerhouses',
  '<div class="grid md:grid-cols-2 gap-6 mb-6">
<div class="bg-blue-50 p-4 rounded-lg">
<h4 class="font-semibold mb-3">New South Wales</h4>
<ul class="text-sm space-y-1">
<li>• Population: 8.2 million (32% of Australia)</li>
<li>• GDP: AUD $650 billion</li>
<li>• Key Cities: Sydney, Newcastle, Wollongong</li>
<li>• Distribution Hubs: Sydney, Erskine Park</li>
</ul>
</div>

<div class="bg-purple-50 p-4 rounded-lg">
<h4 class="font-semibold mb-3">Victoria</h4>
<ul class="text-sm space-y-1">
<li>• Population: 6.7 million (26% of Australia)</li>
<li>• GDP: AUD $500 billion</li>
<li>• Key Cities: Melbourne, Geelong, Ballarat</li>
<li>• Distribution Hubs: Melbourne, Dandenong South</li>
</ul>
</div>
</div>

<p>These two states represent 58% of the Australian population and over 60% of economic activity. Key distribution strategies include:</p>

<ul class="mb-4">
<li><strong>Primary Distribution Centers:</strong> Establish major warehouses in Sydney and Melbourne metro areas</li>
<li><strong>Same-Day Delivery:</strong> Essential for competing in these markets</li>
<li><strong>Transport Links:</strong> Leverage the Sydney-Melbourne freight corridor</li>
<li><strong>Premium Services:</strong> Higher income levels support premium delivery options</li>
</ul>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'state-by-state-considerations'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Queensland, Western Australia, and South Australia',
  '<div class="grid md:grid-cols-3 gap-4 mb-6">
<div class="bg-orange-50 p-4 rounded-lg">
<h4 class="font-semibold mb-2">Queensland</h4>
<ul class="text-xs space-y-1">
<li>• Pop: 5.2M (20%)</li>
<li>• Hub: Brisbane</li>
<li>• Focus: Tourism, mining</li>
</ul>
</div>

<div class="bg-yellow-50 p-4 rounded-lg">
<h4 class="font-semibold mb-2">Western Australia</h4>
<ul class="text-xs space-y-1">
<li>• Pop: 2.8M (11%)</li>
<li>• Hub: Perth</li>
<li>• Focus: Mining, resources</li>
</ul>
</div>

<div class="bg-red-50 p-4 rounded-lg">
<h4 class="font-semibold mb-2">South Australia</h4>
<ul class="text-xs space-y-1">
<li>• Pop: 1.8M (7%)</li>
<li>• Hub: Adelaide</li>
<li>• Focus: Wine, manufacturing</li>
</ul>
</div>
</div>

<h4 class="font-semibold mt-6 mb-3">Distribution Strategies by State:</h4>

<p><strong>Queensland:</strong> Focus on Brisbane metro area (50% of state population). Consider seasonal tourism peaks on Gold Coast and Sunshine Coast. Mining regions require specialized logistics.</p>

<p><strong>Western Australia:</strong> Perth isolation requires dedicated distribution center. High mining wages support premium products. Consider time zone differences (GMT+8).</p>

<p><strong>South Australia:</strong> Adelaide-centric distribution. Strong wine and food culture. Manufacturing base provides B2B opportunities.</p>

<div class="bg-amber-50 p-4 rounded-lg mt-4">
<p><strong>Key Insight:</strong> Each state has distinct consumer preferences and economic drivers. Tailor your distribution strategy accordingly rather than applying a one-size-fits-all approach.</p>
</div>',
  2,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'state-by-state-considerations'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Regulatory Requirements Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Australian Consumer Law and Distribution Compliance',
  '<p>Understanding regulatory requirements is crucial for successful distribution in Australia. The Australian Consumer Law (ACL) provides a national framework governing consumer rights and business obligations.</p>

<h4 class="font-semibold mt-6 mb-3">Key Compliance Areas:</h4>

<div class="bg-red-50 p-4 rounded-lg mb-4">
<h5 class="font-semibold mb-2">Consumer Guarantees</h5>
<ul class="text-sm space-y-1">
<li>• Products must be of acceptable quality</li>
<li>• Fit for purpose and match description</li>
<li>• Repair, replace, or refund obligations</li>
<li>• Warranty requirements and limitations</li>
</ul>
</div>

<div class="bg-blue-50 p-4 rounded-lg mb-4">
<h5 class="font-semibold mb-2">Product Safety and Standards</h5>
<ul class="text-sm space-y-1">
<li>• Mandatory safety standards for specific products</li>
<li>• Electrical goods require RCM (Regulatory Compliance Mark)</li>
<li>• Therapeutic goods require TGA approval</li>
<li>• Food products must comply with Food Standards Australia New Zealand</li>
</ul>
</div>

<h4 class="font-semibold mt-6 mb-3">Import and Customs Considerations:</h4>
<ul class="mb-4">
<li><strong>GST Registration:</strong> Required if annual turnover exceeds AUD $75,000</li>
<li><strong>Import Duties:</strong> Vary by product category and country of origin</li>
<li><strong>Biosecurity:</strong> Strict quarantine requirements for certain products</li>
<li><strong>Documentation:</strong> Commercial invoices, packing lists, certificates of origin</li>
</ul>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'regulatory-requirements'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Technology and E-commerce Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Digital Infrastructure and Payment Systems',
  '<p>Australia boasts world-class digital infrastructure that enables sophisticated distribution strategies. Understanding the technological landscape is key to success.</p>

<h4 class="font-semibold mt-6 mb-3">Payment Preferences and Systems:</h4>

<div class="grid md:grid-cols-2 gap-4 mb-6">
<div class="bg-green-50 p-4 rounded-lg">
<h5 class="font-semibold mb-2">Popular Payment Methods</h5>
<ul class="text-sm space-y-1">
<li>• Credit/Debit Cards: 60% of transactions</li>
<li>• PayPal: 35% of online purchases</li>
<li>• Buy Now, Pay Later: 25% adoption</li>
<li>• Bank Transfer: 15% for high-value items</li>
</ul>
</div>

<div class="bg-purple-50 p-4 rounded-lg">
<h5 class="font-semibold mb-2">BNPL Providers</h5>
<ul class="text-sm space-y-1">
<li>• Afterpay: Market leader</li>
<li>• Zip (formerly Zipco): Growing rapidly</li>
<li>• Klarna: International player</li>
<li>• Sezzle: Smaller market share</li>
</ul>
</div>
</div>

<h4 class="font-semibold mt-6 mb-3">Logistics Technology Solutions:</h4>
<ul class="mb-4">
<li><strong>Warehouse Management Systems:</strong> Integration with local 3PL providers</li>
<li><strong>Last-Mile Optimization:</strong> Route planning for Australian geography</li>
<li><strong>Tracking and Visibility:</strong> Real-time shipment tracking expectations</li>
<li><strong>Returns Management:</strong> Automated returns processing and refunds</li>
</ul>

<div class="bg-blue-50 p-4 rounded-lg">
<p><strong>Technology Tip:</strong> Invest in mobile-optimized solutions. Australian consumers heavily favor mobile shopping, with 60% of online sessions occurring on mobile devices.</p>
</div>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'technology-and-ecommerce'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Case Studies Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Success Story: International Beauty Brand Entry',
  '<div class="bg-pink-50 p-6 rounded-lg mb-6">
<h4 class="font-semibold mb-3">Case Study: European Skincare Brand</h4>
<p class="text-sm mb-4"><strong>Challenge:</strong> Premium European skincare brand seeking to enter Australian market with limited local presence.</p>

<h5 class="font-semibold mb-2">Strategy Implemented:</h5>
<ul class="text-sm space-y-1 mb-4">
<li>• Phase 1: Direct-to-consumer via Shopify Plus</li>
<li>• Phase 2: Partnership with Mecca (premium beauty retailer)</li>
<li>• Phase 3: Amazon Australia marketplace expansion</li>
<li>• Fulfillment: 3PL partnership in Sydney and Melbourne</li>
</ul>

<h5 class="font-semibold mb-2">Results After 18 Months:</h5>
<div class="grid md:grid-cols-3 gap-4">
<div class="text-center">
<div class="text-2xl font-bold text-green-600">AUD $2.3M</div>
<div class="text-xs">Annual Revenue</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold text-blue-600">40%</div>
<div class="text-xs">Repeat Customer Rate</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold text-purple-600">25%</div>
<div class="text-xs">Market Share Growth</div>
</div>
</div>
</div>

<p><strong>Key Success Factors:</strong> Local influencer partnerships, premium positioning, exceptional customer service, and strategic retail partnerships enabled rapid market penetration.</p>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'case-studies'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Success Story: Tech Hardware Distribution',
  '<div class="bg-blue-50 p-6 rounded-lg mb-6">
<h4 class="font-semibold mb-3">Case Study: Smart Home Device Manufacturer</h4>
<p class="text-sm mb-4"><strong>Challenge:</strong> US-based IoT device manufacturer needed to navigate complex regulatory requirements and establish distribution network.</p>

<h5 class="font-semibold mb-2">Distribution Strategy:</h5>
<ul class="text-sm space-y-1 mb-4">
<li>• Obtained RCM certification for electrical compliance</li>
<li>• Partnered with Ingram Micro for B2B distribution</li>
<li>• Secured listings with JB Hi-Fi and Harvey Norman</li>
<li>• Established direct sales through Amazon Australia</li>
<li>• Created specialized installer network program</li>
</ul>

<h5 class="font-semibold mb-2">Challenges Overcome:</h5>
<ul class="text-sm space-y-1 mb-4">
<li>• 6-month RCM certification process</li>
<li>• Seasonal demand fluctuations</li>
<li>• Competition from established brands</li>
<li>• Training retail staff on technical features</li>
</ul>

<h5 class="font-semibold mb-2">18-Month Results:</h5>
<div class="grid md:grid-cols-2 gap-4">
<div class="text-center">
<div class="text-2xl font-bold text-green-600">AUD $5.1M</div>
<div class="text-xs">Revenue</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold text-blue-600">15%</div>
<div class="text-xs">Market Share</div>
</div>
</div>
</div>

<p><strong>Key Learnings:</strong> Regulatory compliance planning, strong retail partnerships, and comprehensive training programs were essential for success in the competitive consumer electronics market.</p>',
  2,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'case-studies'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Implementation Strategy Section
INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Step-by-Step Implementation Framework',
  '<div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
<h4 class="font-semibold mb-4">90-Day Distribution Launch Plan</h4>

<div class="grid md:grid-cols-3 gap-4">
<div class="bg-white p-4 rounded-lg">
<h5 class="font-semibold text-blue-600 mb-2">Days 1-30: Foundation</h5>
<ul class="text-sm space-y-1">
<li>✓ Market research and competitor analysis</li>
<li>✓ Regulatory compliance assessment</li>
<li>✓ Initial partner identification</li>
<li>✓ Legal structure establishment</li>
<li>✓ Banking and payment setup</li>
</ul>
</div>

<div class="bg-white p-4 rounded-lg">
<h5 class="font-semibold text-green-600 mb-2">Days 31-60: Setup</h5>
<ul class="text-sm space-y-1">
<li>✓ Warehouse/3PL partner selection</li>
<li>✓ E-commerce platform development</li>
<li>✓ Initial inventory planning</li>
<li>✓ Pricing strategy finalization</li>
<li>✓ Marketing material localization</li>
</ul>
</div>

<div class="bg-white p-4 rounded-lg">
<h5 class="font-semibold text-purple-600 mb-2">Days 61-90: Launch</h5>
<ul class="text-sm space-y-1">
<li>✓ Soft launch with key partners</li>
<li>✓ Customer service setup</li>
<li>✓ Performance monitoring systems</li>
<li>✓ Full market launch</li>
<li>✓ Initial performance review</li>
</ul>
</div>
</div>
</div>

<h4 class="font-semibold mt-6 mb-3">Critical Success Factors:</h4>
<ul class="mb-4">
<li><strong>Local Partnerships:</strong> Identify and cultivate relationships with key local partners early</li>
<li><strong>Compliance First:</strong> Never compromise on regulatory requirements</li>
<li><strong>Customer Centricity:</strong> Australian consumers expect excellent service</li>
<li><strong>Scalability Planning:</strong> Design systems that can grow with your business</li>
<li><strong>Continuous Optimization:</strong> Regular review and refinement of strategies</li>
</ul>',
  1,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'implementation-strategy'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

INSERT INTO content_bodies (section_id, question, body_text, sort_order, content_type)
SELECT 
  cs.id,
  'Key Performance Indicators and Success Metrics',
  '<h4 class="font-semibold mb-3">Essential KPIs to Track:</h4>

<div class="grid md:grid-cols-2 gap-6 mb-6">
<div class="bg-gray-50 p-4 rounded-lg">
<h5 class="font-semibold mb-3">Operational Metrics</h5>
<ul class="text-sm space-y-2">
<li><strong>Order Fulfillment Rate:</strong> Target >99%</li>
<li><strong>Delivery Time:</strong> Metro <2 days, Regional <5 days</li>
<li><strong>Return Rate:</strong> Industry benchmark <5%</li>
<li><strong>Inventory Turnover:</strong> Optimize by product category</li>
<li><strong>Cost per Order:</strong> Monitor fulfillment efficiency</li>
</ul>
</div>

<div class="bg-gray-50 p-4 rounded-lg">
<h5 class="font-semibold mb-3">Commercial Metrics</h5>
<ul class="text-sm space-y-2">
<li><strong>Revenue Growth:</strong> Month-over-month tracking</li>
<li><strong>Customer Acquisition Cost:</strong> By channel</li>
<li><strong>Customer Lifetime Value:</strong> Cohort analysis</li>
<li><strong>Market Share:</strong> Category-specific</li>
<li><strong>Gross Margin:</strong> After all distribution costs</li>
</ul>
</div>
</div>

<div class="bg-yellow-50 p-4 rounded-lg mb-4">
<h5 class="font-semibold mb-2">Quarterly Review Framework</h5>
<p class="text-sm mb-2">Conduct comprehensive reviews every 90 days focusing on:</p>
<ul class="text-sm space-y-1">
<li>• Performance vs. targets analysis</li>
<li>• Channel effectiveness evaluation</li>
<li>• Customer feedback integration</li>
<li>• Competitive landscape changes</li>
<li>• Strategic adjustments and optimizations</li>
</ul>
</div>

<div class="bg-green-50 p-4 rounded-lg">
<p><strong>Success Benchmark:</strong> Leading international brands typically achieve 15-25% market penetration within 24 months in their target segments when following structured distribution strategies.</p>
</div>',
  2,
  'text'
FROM content_sections cs
JOIN content_items ci ON cs.content_item_id = ci.id
WHERE ci.slug = 'distribution-strategy-australia' AND cs.slug = 'implementation-strategy'
ON CONFLICT (section_id, sort_order) DO UPDATE SET
  question = EXCLUDED.question,
  body_text = EXCLUDED.body_text,
  content_type = EXCLUDED.content_type;

-- Update the main content item with enhanced metadata
UPDATE content_items 
SET 
  subtitle = 'A comprehensive guide to building successful distribution networks across Australia, covering traditional retail, e-commerce, and omnichannel strategies.',
  read_time = 12,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'distribution-strategy-australia';
