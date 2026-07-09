-- Data cleanup: correct 4 VIC trade/agency rows whose website_url/domain pointed at
-- an unrelated company from bad enrichment. Now that the report links agency cards
-- via website_url (P2-F resolveWebsite), these wrong URLs would render as live links
-- to the wrong business — e.g. "Australia China Business Council Victorian Branch"
-- linked to MaxCap Group (a property-investment firm). Correct URLs verified against
-- each organisation's official site.
--
-- Idempotent: each UPDATE is keyed by the stable id AND guarded on the current wrong
-- domain, so re-running after it has applied is a no-op. Touches only these 4 rows.

-- Australia China Business Council Victorian Branch: maxcapgroup.com.au (property firm)
update public.trade_investment_agencies
set website_url = 'https://acbc.com.au/branch/victoria/', domain = 'acbc.com.au'
where id = 'c7cfc6dc-f51f-435b-81e9-a60a31d5ba82' and domain = 'maxcapgroup.com.au';

-- Australia Saudi Business Council: dragomanglobal.com (advisory firm)
update public.trade_investment_agencies
set website_url = 'https://asbc.org.au', domain = 'asbc.org.au'
where id = 'e0aaa6d6-8c74-4859-9419-1202875bcb82' and domain = 'dragomanglobal.com';

-- Consulate General of the Republic of Austria in Victoria: polaron.org (translation services)
update public.trade_investment_agencies
set website_url = 'https://www.austrianconsulate.au', domain = 'austrianconsulate.au'
where id = 'c8fd578b-84ce-4e58-b9d4-cc4e993f1525' and domain = 'polaron.org';

-- Hellenic Australian Chamber of Commerce and Industry (Victoria): fortywinks.com.au (bed retailer)
update public.trade_investment_agencies
set website_url = 'https://www.hacci.com.au', domain = 'hacci.com.au'
where id = '7a3101d7-cd8b-4296-b31d-d103ea2fec19' and domain = 'fortywinks.com.au';
