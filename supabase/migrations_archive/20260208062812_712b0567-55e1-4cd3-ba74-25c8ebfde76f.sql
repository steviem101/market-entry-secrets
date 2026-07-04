
-- Step 1: Fix existing non-conforming data
UPDATE public.user_intake_forms SET industry_sector = 'Computer & Network Security' WHERE industry_sector = 'Cybersecurity';
UPDATE public.user_intake_forms SET industry_sector = 'Medical Devices' WHERE industry_sector = 'MedTech/HealthTech';

-- Step 2: Create validation function
CREATE OR REPLACE FUNCTION public.validate_industry_sector()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  valid_industries text[] := ARRAY[
    'Accounting', 'AI', 'Airlines/Aviation', 'Alternative Dispute Resolution',
    'Alternative Medicine', 'Animation', 'Apparel & Fashion',
    'Architecture & Planning', 'Arts & Crafts', 'Automotive',
    'Aviation & Aerospace', 'Banking', 'Biotechnology', 'Broadcast Media',
    'Building Materials', 'Business Supplies & Equipment', 'Capital Markets',
    'Chemicals', 'Civic & Social Organization', 'Civil Engineering',
    'Commercial Real Estate', 'Computer & Network Security', 'Computer Games',
    'Computer Hardware', 'Computer Networking', 'Computer Software',
    'Construction', 'Consumer Electronics', 'Consumer Goods',
    'Consumer Services', 'Cosmetics', 'Dairy', 'Defense & Space', 'Design',
    'E-learning', 'Education Management',
    'Electrical & Electronic Manufacturing', 'Entertainment',
    'Environmental Services', 'Events Services', 'Executive Office',
    'Facilities Services', 'Farming', 'Financial Services', 'Fine Art',
    'Fishery', 'Food & Beverages', 'Food Production', 'Fundraising',
    'Furniture', 'Gambling & Casinos', 'Glass, Ceramics & Concrete',
    'Government Administration', 'Government Relations', 'Graphic Design',
    'Health, Wellness & Fitness', 'Higher Education',
    'Hospital & Health Care', 'Hospitality', 'Human Resources',
    'Import & Export', 'Individual & Family Services',
    'Industrial Automation', 'Information Services',
    'Information Technology & Services', 'Insurance',
    'International Affairs', 'International Trade & Development', 'Internet',
    'Investment Banking', 'Investment Management', 'Judiciary',
    'Law Enforcement', 'Law Practice', 'Legal Services',
    'Leisure, Travel & Tourism', 'Libraries', 'Logistics & Supply Chain',
    'Luxury Goods & Jewelry', 'Machinery', 'Management Consulting',
    'Maritime', 'Market Research', 'Marketing & Advertising',
    'Mechanical or Industrial Engineering', 'Media Production',
    'Medical Devices', 'Medical Practice', 'Mental Health Care', 'Military',
    'Mining & Metals', 'Motion Pictures & Film', 'Museums & Institutions',
    'Music', 'Nanotechnology', 'Newspapers',
    'Non-profit Organization Management', 'Oil & Energy', 'Online Media',
    'Other', 'Outsourcing/Offshoring', 'Package/Freight Delivery',
    'Packaging & Containers', 'Paper & Forest Products', 'Performing Arts',
    'Pharmaceuticals', 'Philanthropy', 'Photography', 'Plastics',
    'Political Organization', 'Primary/Secondary Education', 'Printing',
    'Professional Training & Coaching', 'Program Development',
    'Public Policy', 'Public Relations & Communications', 'Public Safety',
    'Publishing', 'Railroad Manufacture', 'Ranching', 'Real Estate',
    'Recreational Facilities & Services', 'Religious Institutions',
    'Renewables & Environment', 'Research', 'Restaurants', 'Retail', 'SaaS',
    'Security & Investigations', 'Semiconductors', 'Shipbuilding',
    'Sporting Goods', 'Sports', 'Staffing & Recruiting', 'Supermarkets',
    'Telecommunications', 'Textiles', 'Think Tanks', 'Tobacco',
    'Translation & Localization', 'Transportation/Trucking/Railroad',
    'Utilities', 'Venture Capital & Private Equity', 'Veterinary',
    'Warehousing', 'Wholesale', 'Wine & Spirits', 'Wireless',
    'Writing & Editing'
  ];
BEGIN
  IF NOT (NEW.industry_sector = ANY(valid_industries)) THEN
    RAISE EXCEPTION 'Invalid industry_sector value: %. Must be one of the 149 approved industries.', NEW.industry_sector;
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Create trigger
CREATE TRIGGER validate_industry_sector_trigger
  BEFORE INSERT OR UPDATE OF industry_sector ON public.user_intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_industry_sector();
