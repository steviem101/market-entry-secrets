
-- Add more relevant experts/mentors to the community_members table
INSERT INTO public.community_members (
  name, title, description, location, experience, specialties, website, contact,
  company, is_anonymous, experience_tiles
) VALUES 
(
  'Sarah Chen',
  'Market Entry Strategist',
  'Former McKinsey consultant specializing in Asia-Pacific market entry. Has guided 50+ companies through successful Australian market launches across fintech, e-commerce, and SaaS sectors.',
  'Sydney, NSW',
  '12+ years',
  ARRAY['Market Research', 'Go-to-Market Strategy', 'Regulatory Compliance', 'Partnership Development'],
  'https://sarahchen.consulting',
  'sarah@marketentry.com.au',
  'Chen Strategic Consulting',
  false,
  '[
    {"id": "1", "name": "McKinsey & Company", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Stripe", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Airbnb", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Michael O''Sullivan',
  'Legal & Regulatory Expert',
  'Senior partner at top-tier law firm with extensive experience in Australian business law, foreign investment approvals, and corporate structuring for international companies.',
  'Melbourne, VIC',
  '15+ years',
  ARRAY['Corporate Law', 'FIRB Applications', 'Tax Structuring', 'Compliance'],
  'https://osullivan-legal.com.au',
  'michael@osullivan-legal.com.au',
  'O''Sullivan Partners',
  false,
  '[
    {"id": "1", "name": "King & Wood Mallesons", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Commonwealth Bank", "logo": "/placeholder.svg"},
    {"id": "3", "name": "BHP", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Priya Sharma',
  'Digital Marketing Specialist',
  'Award-winning digital marketing expert who has helped 200+ international brands establish their Australian presence. Specializes in culturally-adapted campaigns and local influencer networks.',
  'Brisbane, QLD',
  '8+ years',
  ARRAY['Digital Marketing', 'Social Media Strategy', 'Content Localization', 'Influencer Marketing'],
  'https://priyasharma.marketing',
  'priya@localmkt.com.au',
  'Local Marketing Solutions',
  false,
  '[
    {"id": "1", "name": "Google", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Facebook", "logo": "/placeholder.svg"},
    {"id": "3", "name": "TikTok", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'James McDonald',
  'Supply Chain & Logistics Expert',
  'Former head of operations at major Australian retailer. Expert in establishing distribution networks, warehouse operations, and last-mile delivery across Australia and New Zealand.',
  'Perth, WA',
  '10+ years',
  ARRAY['Supply Chain Management', 'Logistics', 'Distribution Networks', 'Inventory Management'],
  'https://jamesmcdonald.logistics',
  'james@supplychain.expert',
  'McDonald Logistics Consulting',
  false,
  '[
    {"id": "1", "name": "Woolworths", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Australia Post", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Toll Group", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Emma Thompson',
  'HR & Talent Acquisition Lead',
  'Specialist in building Australian teams for international companies. Expert in local employment law, cultural integration, and recruiting top talent in competitive markets.',
  'Adelaide, SA',
  '9+ years',
  ARRAY['Talent Acquisition', 'HR Strategy', 'Employment Law', 'Team Building'],
  'https://emmathompson.hr',
  'emma@talentbridge.com.au',
  'TalentBridge Australia',
  false,
  '[
    {"id": "1", "name": "Seek", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Atlassian", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Canva", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'David Kim',
  'Fintech & Banking Specialist',
  'Former senior executive at major Australian banks. Helps international fintech companies navigate Australian financial regulations, obtain licenses, and build banking partnerships.',
  'Sydney, NSW',
  '14+ years',
  ARRAY['Financial Services', 'Banking Regulations', 'Fintech Licensing', 'Payment Systems'],
  'https://davidkim.fintech',
  'david@fintech.consulting',
  'Kim Financial Advisory',
  false,
  '[
    {"id": "1", "name": "Commonwealth Bank", "logo": "/placeholder.svg"},
    {"id": "2", "name": "ASIC", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Afterpay", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Rachel Green',
  'E-commerce & Retail Expert',
  'Led Australian expansions for multiple global e-commerce brands. Expert in local consumer behavior, marketplace integrations, and omnichannel retail strategies.',
  'Melbourne, VIC',
  '11+ years',
  ARRAY['E-commerce Strategy', 'Retail Operations', 'Marketplace Integration', 'Consumer Insights'],
  'https://rachelgreen.ecommerce',
  'rachel@ecommerce.guru',
  'Green Retail Strategies',
  false,
  '[
    {"id": "1", "name": "Amazon", "logo": "/placeholder.svg"},
    {"id": "2", "name": "eBay", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Shopify", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Anonymous Venture Capitalist',
  'Investment & Funding Expert',
  'Senior partner at leading Australian VC firm. Has evaluated and funded 100+ international companies entering the Australian market. Provides insights on investor expectations and funding strategies.',
  'Sydney, NSW',
  '16+ years',
  ARRAY['Venture Capital', 'Investment Strategy', 'Due Diligence', 'Market Validation'],
  null,
  null,
  'Tier-1 VC Fund',
  true,
  '[
    {"id": "1", "name": "Blackbird Ventures", "logo": "/placeholder.svg"},
    {"id": "2", "name": "AirTree Ventures", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Square Peg Capital", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Tony Nguyen',
  'Technology & SaaS Specialist',
  'Former CTO of successful Australian tech unicorn. Helps international SaaS companies with technical infrastructure, data residency requirements, and scaling engineering teams locally.',
  'Brisbane, QLD',
  '13+ years',
  ARRAY['SaaS Architecture', 'Data Compliance', 'Engineering Leadership', 'Cloud Infrastructure'],
  'https://tonynguyen.tech',
  'tony@saas.consulting',
  'Nguyen Tech Advisory',
  false,
  '[
    {"id": "1", "name": "Atlassian", "logo": "/placeholder.svg"},
    {"id": "2", "name": "AWS", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Microsoft", "logo": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Lisa Anderson',
  'Healthcare & Life Sciences Expert',
  'Former regulatory affairs director with deep knowledge of TGA approvals, healthcare partnerships, and medical device registrations in Australia.',
  'Melbourne, VIC',
  '12+ years',
  ARRAY['TGA Compliance', 'Healthcare Partnerships', 'Medical Device Registration', 'Clinical Trials'],
  'https://lisaanderson.health',
  'lisa@healthreg.com.au',
  'Anderson Health Consulting',
  false,
  '[
    {"id": "1", "name": "TGA", "logo": "/placeholder.svg"},
    {"id": "2", "name": "CSL", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Cochlear", "logo": "/placeholder.svg"}
  ]'::jsonb
);
