
-- First, let's check what logo URLs we currently have
SELECT name, logo FROM public.service_providers WHERE logo IS NOT NULL;

-- Update with verified working logo URLs
UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center'
WHERE name = 'TechVisa';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop&crop=center'
WHERE name = 'Sleek';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop&crop=center'
WHERE name = 'LegalVision';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop&crop=center'
WHERE name = 'Cloud Recruit';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop&crop=center'
WHERE name = 'Rippling Australia';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&h=200&fit=crop&crop=center'
WHERE name = 'McKinsey & Company';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=200&fit=crop&crop=center'
WHERE name = 'PwC Australia';

UPDATE public.service_providers 
SET logo = 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=200&h=200&fit=crop&crop=center'
WHERE name = 'Accenture Australia';
