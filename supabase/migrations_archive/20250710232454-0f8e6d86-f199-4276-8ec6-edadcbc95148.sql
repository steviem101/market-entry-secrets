-- Insert the remaining 9 Australian startup accelerators into innovation_ecosystem table

INSERT INTO public.innovation_ecosystem (
  name, description, location, founded, employees, services, website, contact, 
  experience_tiles, contact_persons
) VALUES 

-- Startmate
(
  'Startmate',
  'One of Australia''s most renowned accelerators offering a 12-week program that provides funding, mentorship, and access to a vast network of successful founders and investors. They invest $120,000 in exchange for 7.5% equity and support startups across various sectors.',
  'Sydney & Melbourne',
  '2013',
  '25-50',
  ARRAY['Startup Acceleration', 'Seed Funding', 'Mentorship', 'Network Access', 'Investor Connections', 'Product Development'],
  'https://www.startmate.com.au',
  'hello@startmate.com.au',
  '[{"id": "1", "name": "Canva", "logo": "/placeholder.svg"}, {"id": "2", "name": "Bugcrowd", "logo": "/placeholder.svg"}, {"id": "3", "name": "SafetyCulture", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Michael Batko", "role": "CEO & Co-founder", "image": "/placeholder.svg"}, {"id": "2", "name": "Niki Scevak", "role": "Co-founder", "image": "/placeholder.svg"}]'
),

-- Antler Australia
(
  'Antler Australia',
  'Global early-stage VC and accelerator that helps individuals build startups from scratch. Their program includes team formation, business model validation, and initial funding. Antler has invested in over 1,000 companies worldwide.',
  'Sydney',
  '2017',
  '50-100',
  ARRAY['Team Formation', 'Business Model Validation', 'Initial Funding', 'Early-stage Investment', 'Global Network', 'Startup Incubation'],
  'https://www.antler.co/locations/sydney',
  'sydney@antler.co',
  '[{"id": "1", "name": "Edenlab", "logo": "/placeholder.svg"}, {"id": "2", "name": "Vow", "logo": "/placeholder.svg"}, {"id": "3", "name": "Eucalyptus", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Bede Moore", "role": "Partner", "image": "/placeholder.svg"}, {"id": "2", "name": "David Johnston", "role": "Partner", "image": "/placeholder.svg"}]'
),

-- muru-D
(
  'muru-D',
  'Backed by Telstra, muru-D offers a six-month accelerator program providing seed funding, mentoring, and access to a global network. They focus on technology startups aiming for global markets.',
  'Sydney & Melbourne',
  '2013',
  '10-25',
  ARRAY['Seed Funding', 'Mentoring', 'Global Network Access', 'Technology Focus', 'Market Expansion', 'Corporate Partnerships'],
  'https://www.muru-d.com',
  'info@muru-d.com',
  '[{"id": "1", "name": "Deputy", "logo": "/placeholder.svg"}, {"id": "2", "name": "Stackla", "logo": "/placeholder.svg"}, {"id": "3", "name": "Hey You", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Annie Parker", "role": "General Manager", "image": "/placeholder.svg"}, {"id": "2", "name": "Mark Licciardo", "role": "Investment Director", "image": "/placeholder.svg"}]'
),

-- H2 Ventures
(
  'H2 Ventures',
  'Specializing in fintech, data, and AI startups, H2 Ventures offers a 20-week accelerator program with seed funding, mentorship, and access to a network of investors and industry experts.',
  'Sydney',
  '2015',
  '10-25',
  ARRAY['Fintech Acceleration', 'AI & Data Focus', 'Seed Funding', 'Industry Expertise', 'Investor Network', 'Regulatory Guidance'],
  'https://www.h2ventures.com',
  'info@h2ventures.com',
  '[{"id": "1", "name": "Zip Co", "logo": "/placeholder.svg"}, {"id": "2", "name": "Prospa", "logo": "/placeholder.svg"}, {"id": "3", "name": "MoneyMe", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Ben Heap", "role": "Co-founder & Managing Partner", "image": "/placeholder.svg"}, {"id": "2", "name": "Toby Heap", "role": "Co-founder & Managing Partner", "image": "/placeholder.svg"}]'
),

-- River City Labs
(
  'River City Labs',
  'Founded by entrepreneur Steve Baxter, River City Labs provides coworking spaces, mentoring, and workshops. They have partnered with muru-D to offer accelerator programs supporting Queensland startups.',
  'Brisbane',
  '2012',
  '25-50',
  ARRAY['Coworking Space', 'Mentoring', 'Workshops', 'Startup Community', 'Networking Events', 'Business Development'],
  'https://www.rivercitylabs.net',
  'hello@rivercitylabs.net',
  '[{"id": "1", "name": "RedEye", "logo": "/placeholder.svg"}, {"id": "2", "name": "Code Camp", "logo": "/placeholder.svg"}, {"id": "3", "name": "Clipchamp", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Steve Baxter", "role": "Founder", "image": "/placeholder.svg"}, {"id": "2", "name": "Peta Ellis", "role": "General Manager", "image": "/placeholder.svg"}]'
),

-- Melbourne Accelerator Program (MAP)
(
  'Melbourne Accelerator Program (MAP)',
  'Run by the University of Melbourne, MAP offers a five-month accelerator program providing funding, office space, mentoring, and pitching opportunities for technology startups.',
  'Melbourne',
  '2012',
  '10-25',
  ARRAY['University-backed Program', 'Seed Funding', 'Office Space', 'Academic Resources', 'Mentoring', 'Pitching Opportunities'],
  'https://www.map.melbourne.edu.au',
  'map-info@unimelb.edu.au',
  '[{"id": "1", "name": "Flurosat", "logo": "/placeholder.svg"}, {"id": "2", "name": "MEQ Probe", "logo": "/placeholder.svg"}, {"id": "3", "name": "Kinoxis", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Rohan Workman", "role": "Director", "image": "/placeholder.svg"}, {"id": "2", "name": "Paul Magill", "role": "Program Manager", "image": "/placeholder.svg"}]'
),

-- Cicada Innovations
(
  'Cicada Innovations',
  'Cicada Innovations focuses on deep tech startups in sectors like medtech, agtech, and cleantech. They offer incubation, acceleration, and commercialization support with access to research facilities.',
  'Sydney',
  '2000',
  '50-100',
  ARRAY['Deep Tech Incubation', 'Medtech Focus', 'Agtech Focus', 'Cleantech Focus', 'Research Facilities', 'Commercialization Support'],
  'https://www.cicadainnovations.com',
  'info@cicadainnovations.com',
  '[{"id": "1", "name": "Samsara Eco", "logo": "/placeholder.svg"}, {"id": "2", "name": "Harrison.ai", "logo": "/placeholder.svg"}, {"id": "3", "name": "Morse Micro", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Sally-Ann Williams", "role": "CEO", "image": "/placeholder.svg"}, {"id": "2", "name": "Petra Andrén", "role": "Managing Director", "image": "/placeholder.svg"}]'
),

-- ThincLab
(
  'ThincLab',
  'ThincLab, operated by the University of Adelaide, supports startups in agtech, space, and social enterprise sectors. They offer mentoring, office space, and access to research facilities.',
  'Adelaide',
  '2017',
  '10-25',
  ARRAY['University-backed Incubator', 'Agtech Focus', 'Space Industry', 'Social Enterprise', 'Research Access', 'Mentoring Program'],
  'https://www.thinclab.com',
  'hello@thinclab.com',
  '[{"id": "1", "name": "Fleet Space Technologies", "logo": "/placeholder.svg"}, {"id": "2", "name": "Myriota", "logo": "/placeholder.svg"}, {"id": "3", "name": "Ping Services", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Jasmine Vreugdenburg", "role": "Director", "image": "/placeholder.svg"}, {"id": "2", "name": "Ryan Berton", "role": "Operations Manager", "image": "/placeholder.svg"}]'
),

-- Innovation Collaboration Centre (ICC)
(
  'Innovation Collaboration Centre (ICC)',
  'ICC runs the Venture Catalyst programs, supporting startups in the space industry and high-tech sectors. They provide funding, mentoring, and access to industry networks with focus on deep tech commercialization.',
  'Adelaide',
  '2009',
  '25-50',
  ARRAY['Venture Catalyst Program', 'Space Industry Focus', 'Deep Tech', 'Funding Support', 'Industry Networks', 'Commercialization'],
  'https://www.innovationcollaboration.com.au',
  'info@innovationcollaboration.com.au',
  '[{"id": "1", "name": "Inovor Technologies", "logo": "/placeholder.svg"}, {"id": "2", "name": "Southern Launch", "logo": "/placeholder.svg"}, {"id": "3", "name": "Neumann Space", "logo": "/placeholder.svg"}]',
  '[{"id": "1", "name": "Dr. Roger Dunne", "role": "CEO", "image": "/placeholder.svg"}, {"id": "2", "name": "Andrew Nairn", "role": "Investment Director", "image": "/placeholder.svg"}]'
);