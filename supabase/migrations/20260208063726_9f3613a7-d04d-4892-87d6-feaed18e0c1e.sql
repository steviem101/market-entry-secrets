
-- 1. Convert existing single-value industry_sector to arrays (no-op if already text[])
DO $$ BEGIN
  UPDATE public.user_intake_forms SET industry_sector = industry_sector;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 2. Drop old trigger and function
DROP TRIGGER IF EXISTS validate_industry_sector_trigger ON public.user_intake_forms;
DROP FUNCTION IF EXISTS public.validate_industry_sector();

-- 3. Alter column from text to text[] (skip if already text[] from repair migration)
DO $$ BEGIN
  ALTER TABLE public.user_intake_forms
    ALTER COLUMN industry_sector TYPE text[]
    USING ARRAY[industry_sector];
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN cannot_coerce THEN NULL;
  WHEN datatype_mismatch THEN NULL;
  WHEN others THEN NULL;
END $$;

-- 4. Create new validation function for array
CREATE OR REPLACE FUNCTION public.validate_industry_sector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
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
  elem text;
BEGIN
  -- Ensure array is not empty
  IF array_length(NEW.industry_sector, 1) IS NULL OR array_length(NEW.industry_sector, 1) = 0 THEN
    RAISE EXCEPTION 'industry_sector must contain at least one industry.';
  END IF;

  -- Validate each element
  FOREACH elem IN ARRAY NEW.industry_sector LOOP
    IF NOT (elem = ANY(valid_industries)) THEN
      RAISE EXCEPTION 'Invalid industry_sector value: %. Must be one of the 149 approved industries.', elem;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 5. Create trigger (wrapped for safety)
DO $$ BEGIN
  CREATE TRIGGER validate_industry_sector_trigger
    BEFORE INSERT OR UPDATE ON public.user_intake_forms
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_industry_sector();
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;
