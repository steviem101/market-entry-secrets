
-- Create a table for trade and investment agencies
CREATE TABLE public.trade_investment_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]'::jsonb,
  contact_persons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.trade_investment_agencies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample data for trade and investment agencies
INSERT INTO public.trade_investment_agencies (
  name, description, location, founded, employees, services, website, contact,
  basic_info, why_work_with_us, experience_tiles, contact_persons
) VALUES 
(
  'Austrade',
  'Australia''s trade and investment promotion agency helping Australian businesses succeed in international markets and promoting Australia as an investment destination.',
  'Multiple Locations',
  '1985',
  '1000+',
  ARRAY['Export Promotion', 'Investment Attraction', 'Market Intelligence', 'Trade Missions', 'Business Matching'],
  'https://austrade.gov.au',
  'info@austrade.gov.au',
  'Austrade is the Australian Government''s trade and investment promotion agency. We help Australian businesses, education institutions, tourism operators, governments and citizens as they develop international markets, win productive foreign investment, promote international education, and strengthen Australia''s tourism industry.',
  'Partner with Austrade to leverage our extensive global network, deep market knowledge, and government backing to accelerate your international expansion. We provide comprehensive support from market entry strategy to on-ground assistance.',
  '[
    {"id": "1", "name": "BHP", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Westpac", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Telstra", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Sarah Mitchell", "role": "Senior Trade Commissioner", "image": "/placeholder.svg"},
    {"id": "2", "name": "David Chen", "role": "Investment Director", "image": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Investment NSW',
  'New South Wales'' premier investment promotion agency focused on attracting and facilitating productive foreign investment to drive economic growth.',
  'Sydney, NSW',
  '2011',
  '100-200',
  ARRAY['Investment Facilitation', 'Business Concierge', 'Site Selection', 'Regulatory Support', 'Investor Aftercare'],
  'https://investment.nsw.gov.au',
  'invest@investment.nsw.gov.au',
  'Investment NSW is the NSW Government''s dedicated investment promotion agency. We work with international businesses to establish, expand or relocate their operations to NSW, providing tailored support throughout their investment journey.',
  'Choose Investment NSW as your trusted partner to navigate the Australian market. We offer unparalleled access to government networks, streamlined regulatory processes, and comprehensive aftercare services to ensure your investment success.',
  '[
    {"id": "1", "name": "Commonwealth Bank", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Atlassian", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Canva", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Emma Thompson", "role": "Managing Director", "image": "/placeholder.svg"},
    {"id": "2", "name": "James Rodriguez", "role": "Senior Investment Manager", "image": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Enterprise Ireland',
  'Ireland''s trade and innovation agency supporting Irish enterprises to start, scale, innovate and win export sales in global markets.',
  'Dublin, Ireland',
  '1998',
  '800+',
  ARRAY['Export Development', 'Innovation Support', 'Market Entry', 'Funding Programs', 'International Partnerships'],
  'https://enterprise-ireland.com',
  'info@enterprise-ireland.com',
  'Enterprise Ireland is the government organisation responsible for the development and growth of Irish enterprises in world markets. We work with Irish entrepreneurs and companies to help them start, grow, innovate and win export sales.',
  'Partner with Enterprise Ireland to access our proven track record in building global Irish success stories. We provide funding, mentorship, and market access that has helped create some of the world''s most successful technology companies.',
  '[
    {"id": "1", "name": "AIB", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Kerry Group", "logo": "/placeholder.svg"},
    {"id": "3", "name": "CRH", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Michael O''Brien", "role": "Regional Director", "image": "/placeholder.svg"},
    {"id": "2", "name": "Claire Murphy", "role": "Market Advisor", "image": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Irish Australian Chamber of Commerce',
  'Promoting trade and investment between Ireland and Australia through networking, advocacy, and business development opportunities.',
  'Sydney, NSW',
  '1995',
  '10-25',
  ARRAY['Business Networking', 'Trade Missions', 'Market Intelligence', 'Event Management', 'Advocacy'],
  'https://iacc.com.au',
  'info@iacc.com.au',
  'The Irish Australian Chamber of Commerce is a not-for-profit organisation dedicated to promoting trade and investment between Ireland and Australia. We facilitate business connections and provide a platform for Irish and Australian companies to explore opportunities.',
  'Join our vibrant community of business leaders and entrepreneurs. We provide exclusive networking opportunities, market insights, and access to decision-makers in both Irish and Australian markets.',
  '[
    {"id": "1", "name": "Tourism Ireland", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Bank of Ireland", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Aer Lingus", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Patrick Kelly", "role": "President", "image": "/placeholder.svg"},
    {"id": "2", "name": "Sinead Walsh", "role": "Executive Director", "image": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Australian British Chamber of Commerce',
  'Australia''s premier bilateral chamber promoting trade, investment and cultural ties between Australia and the United Kingdom.',
  'Multiple Locations',
  '1957',
  '25-50',
  ARRAY['Trade Facilitation', 'Business Events', 'Market Entry Support', 'Government Relations', 'Cultural Exchange'],
  'https://abcc.com.au',
  'info@abcc.com.au',
  'The Australian British Chamber of Commerce is the peak body representing business interests between Australia and the UK. With chapters across Australia, we facilitate trade, investment and business relationships between the two nations.',
  'Leverage our 65+ year history and extensive networks across Australia and the UK. We provide unparalleled access to government officials, business leaders, and market opportunities in both countries.',
  '[
    {"id": "1", "name": "HSBC", "logo": "/placeholder.svg"},
    {"id": "2", "name": "BP Australia", "logo": "/placeholder.svg"},
    {"id": "3", "name": "Rolls-Royce", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Victoria Hamilton", "role": "CEO", "image": "/placeholder.svg"},
    {"id": "2", "name": "Robert Davies", "role": "Trade Director", "image": "/placeholder.svg"}
  ]'::jsonb
),
(
  'Invest Northern Ireland',
  'Northern Ireland''s regional economic development agency supporting business growth and attracting investment to drive economic development.',
  'Belfast, Northern Ireland',
  '2002',
  '500+',
  ARRAY['Investment Promotion', 'Business Development', 'Innovation Support', 'Export Assistance', 'Skills Development'],
  'https://investni.com',
  'info@investni.com',
  'Invest Northern Ireland is the regional economic development agency for Northern Ireland. We support businesses to compete internationally and we attract new investment to Northern Ireland.',
  'Choose Northern Ireland as your gateway to European and global markets. We offer competitive costs, skilled workforce, and comprehensive support packages that have attracted leading global companies to establish operations here.',
  '[
    {"id": "1", "name": "Citigroup", "logo": "/placeholder.svg"},
    {"id": "2", "name": "Allstate", "logo": "/placeholder.svg"},
    {"id": "3", "name": "CME Group", "logo": "/placeholder.svg"}
  ]'::jsonb,
  '[
    {"id": "1", "name": "Mel Chittock", "role": "CEO", "image": "/placeholder.svg"},
    {"id": "2", "name": "Brian Dolaghan", "role": "Executive Director", "image": "/placeholder.svg"}
  ]'::jsonb
);
