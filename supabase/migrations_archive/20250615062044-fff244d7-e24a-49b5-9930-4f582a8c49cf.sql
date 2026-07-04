
-- Update service providers with their official logo URLs
UPDATE public.service_providers 
SET logo = 'https://techvisa.com.au/wp-content/uploads/2021/03/TechVisa-Logo.png'
WHERE name = 'TechVisa';

UPDATE public.service_providers 
SET logo = 'https://sleek.com/static/images/sleek-logo.svg'
WHERE name = 'Sleek';

UPDATE public.service_providers 
SET logo = 'https://legalvision.com.au/wp-content/themes/legalvision/assets/images/logo.svg'
WHERE name = 'LegalVision';

UPDATE public.service_providers 
SET logo = 'https://media.licdn.com/dms/image/C560BAQHxQj9J5J5J5A/company-logo_200_200/0/1630640000000?e=2147483647&v=beta&t=xyz'
WHERE name = 'Cloud Recruit';

UPDATE public.service_providers 
SET logo = 'https://assets-global.website-files.com/5f1ca25be822fc1e09b14023/5f1ca25be822fc4309b140f4_rippling-logo.svg'
WHERE name = 'Rippling Australia';
