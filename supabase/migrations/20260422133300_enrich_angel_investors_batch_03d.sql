-- Enrich angel investors — batch 03d (records 169-173: Michael Jankie → Muhilan Sriravindrarajah)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based serial founder, operator and angel investor. Founder of various tech ventures. Active angel via TEN13 syndicate. Sector-agnostic with portfolio including Tractor Beverages, Flying Fox and TEN13. $10k–$50k cheques.',
  basic_info = 'Michael Jankie is a Melbourne-based serial founder, operator and angel investor. He is an active angel and a known participant in the **TEN13** syndicate (Stew Glynn / Steve Baxter''s Sydney-based angel investment platform).

His CSV-listed portfolio includes:
- **Tractor Beverages** (consumer beverage brand)
- **Flying Fox** (Australian consumer / e-commerce)
- **TEN13** (syndicate participation)
- Plus additional truncated names

CSV cheque size $10k–$50k. Stated sector mandate is "All". Active across consumer-brand and SaaS deals.',
  why_work_with_us = 'For Australian consumer-brand, DTC and tech founders looking for a Melbourne-based generalist angel cheque from someone with active TEN13 syndicate exposure — useful for founders looking to plug into Australia''s broader angel community.',
  sector_focus = ARRAY['Generalist','Consumer','DTC','SaaS','Beverages','E-commerce'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/jankie/',
  contact_email = 'me@mjankie.lol',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Tractor Beverages','Flying Fox','TEN13 (syndicate)'],
  meta_title = 'Michael Jankie — Melbourne Angel | TEN13, Tractor, Flying Fox',
  meta_description = 'Melbourne sector-agnostic angel via TEN13. Tractor Beverages, Flying Fox in portfolio. $10k–$50k.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic Melbourne angel; active TEN13 syndicate participant.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/jankie/'
    ),
    'corrections','CSV portfolio truncated ("Tractor, Flying Fox, Ten13..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Michael Jankie';

UPDATE investors SET
  description = 'Brisbane-based angel investor and venture professional. Portfolio includes Clipchamp (acquired by Microsoft 2021) and Arkose Labs (US fraud-prevention scale-up). Software, health and agritech focus. Enterprise growth / corporate background.',
  basic_info = 'Michal (Mike) Wallas is a Brisbane-based angel investor and venture/enterprise professional. His CSV email suggests **Enterprise Growth** affiliation. He has a notable angel portfolio that includes:
- **Clipchamp** (Australian browser-based video editor — acquired by Microsoft in 2021 for a reported ~US$500M)
- **Arkose Labs** (US-headquartered fraud-prevention scale-up with strong Australian roots)
- Plus additional truncated names

Stated thesis covers **Software, Health and AgriTech**. Brisbane is a relatively under-covered angel market and Mike sits among the most credentialed angels active there.',
  why_work_with_us = 'For Australian software, health-tech and agri-tech founders — and especially Brisbane/Queensland-based founders — Mike brings a high-quality portfolio with two genuinely standout names (Clipchamp/Microsoft acquisition and Arkose Labs) plus enterprise-growth networks for go-to-market support.',
  sector_focus = ARRAY['Software','SaaS','Health Tech','AgriTech','Cybersecurity','B2B'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/mikewallas',
  contact_email = 'mwallas@enterprisegrowth.com.au',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Clipchamp (acquired by Microsoft 2021)','Arkose Labs'],
  meta_title = 'Mike Wallas — Brisbane Angel | Clipchamp, Arkose Labs Portfolio',
  meta_description = 'Brisbane angel. Software, health, agritech focus. Clipchamp (Microsoft) and Arkose Labs in portfolio.',
  details = jsonb_build_object(
    'investment_thesis','Software, Health, AgriTech Brisbane angel.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Clipchamp','context','Acquired by Microsoft 2021 (~US$500M)'),
      jsonb_build_object('company','Arkose Labs','context','US fraud-prevention scale-up with Australian roots')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mikewallas'
    ),
    'corrections','CSV portfolio truncated ("ClipChamp, Arkose Labs, ..."). Two retained verbatim. CSV email truncated.'
  ),
  updated_at = now()
WHERE name = 'Michal Wallas';

UPDATE investors SET
  description = 'Sydney-based serial founder, operator and angel investor. Co-founder of Pollenizer (Australia''s pioneering startup studio). Climate Salad founder. Climate-tech specialist angel. $25k cheques. One of Australia''s most influential climate-tech voices.',
  basic_info = 'Mick Liubinskas is one of Australia''s most influential and active early-stage tech operators and angel investors. He has been at the centre of the Australian startup ecosystem for two decades.

He is the **Co-Founder of Pollenizer** — Australia''s pioneering startup studio (with Phil Morle) — and the **Founder of Climate Salad**, the climate-tech community / network connecting Australian climate founders, capital and corporates.

His CSV-listed portfolio includes:
- **Flightfox** (travel/marketplace)
- **Functionly** (org-design SaaS — also Matt Bauer portfolio)
- **Star...** (truncated)
- Plus additional names

CSV cheque size $25k. Current explicit thesis: **Climate tech**.

Mick is Sydney-based and is widely recognised as one of the most accessible, pro-founder angels in Australia. He also frequently advises and participates in Climate Salad-coordinated capital programmes.',
  why_work_with_us = 'For Australian climate-tech founders, Mick Liubinskas is among the most relevant single individuals to know — his Climate Salad community is the most active climate-tech network in the country and he combines that platform reach with personal cheque deployment. Also useful for any startup-studio-style founders given his Pollenizer roots.',
  sector_focus = ARRAY['ClimateTech','Energy Transition','SaaS','Marketplace','Travel Tech','DeepTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/mliubinskas/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Flightfox','Functionly','Climate Salad (Founder)','Pollenizer (Co-Founder)'],
  meta_title = 'Mick Liubinskas — Climate Salad Founder | Sydney Climate Angel',
  meta_description = 'Sydney climate-tech angel. Pollenizer co-founder. Climate Salad founder. $25k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Pollenizer (Co-Founder, with Phil Morle)','Climate Salad (Founder)'],
    'investment_thesis','Climate tech — strong climate community-network leverage.',
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mliubinskas/',
      'climate_salad','https://www.climatesalad.com/'
    ),
    'corrections','CSV portfolio truncated ("Flightfox, Functionly, Star..."). Two retained verbatim plus founder-of entries added.'
  ),
  updated_at = now()
WHERE name = 'Mick Liubinskas';

UPDATE investors SET
  description = 'Sydney-based co-founder and co-CEO of Atlassian (NASDAQ: TEAM, ~AUD multi-billion market cap). Founder of Grok Ventures (his family office / personal investment vehicle). One of Australia''s most prominent tech billionaires and climate/clean-energy investors. Major focus: climate-tech, clean-energy, deep-tech.',
  basic_info = 'Mike Cannon-Brookes is the **Co-Founder and Co-CEO of Atlassian** (NASDAQ: TEAM) — one of Australia''s most successful technology companies — and one of Australia''s most prominent tech entrepreneurs and investors.

His personal investment activity is run through **Grok Ventures**, his family office. Grok has been one of the most active climate-tech and clean-energy investors in Australia, with major positions including:
- Significant stake-holding in **AGL Energy** (used to push for accelerated coal-plant retirement)
- **Sun Cable** (Australia–Singapore solar export project; led 2023 acquisition out of administration)
- **Tesla** (well-publicised Powerwall/grid partnerships in South Australia)
- Plus broad climate-tech and software portfolio

His public Twitter/X list of personal investments was the CSV reference. He is a public climate advocate and his cheque sizes range from small experimental angel positions to nine-figure energy-infrastructure commitments.',
  why_work_with_us = 'For Australian climate-tech, clean-energy, grid, deep-tech and software founders — Grok Ventures is one of the largest and most ambitious private capital pools in the country. Mike personally backs founders directly and through Grok across stages. Particularly transformational for energy-transition founders given his Sun Cable and AGL track record.',
  sector_focus = ARRAY['ClimateTech','Clean Energy','Energy','Deep Tech','Software','SaaS','Grid','Solar'],
  stage_focus = ARRAY['Seed','Series A','Series B','Growth','Late Stage'],
  contact_email = 'hi@grok.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Atlassian (Co-Founder/Co-CEO)','Grok Ventures (Founder)','Sun Cable','AGL Energy (significant stake)','Tesla (partnerships)'],
  meta_title = 'Mike Cannon-Brookes — Atlassian Co-CEO | Grok Ventures | Sydney',
  meta_description = 'Atlassian Co-Founder/Co-CEO. Grok Ventures founder. Climate-tech, clean energy, software. Sun Cable, AGL.',
  details = jsonb_build_object(
    'firms', ARRAY['Atlassian (Co-Founder/Co-CEO; NASDAQ: TEAM)','Grok Ventures (Founder)'],
    'investment_thesis','Climate-tech, clean-energy and software — biggest private climate cheque-writer in Australia.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Sun Cable','context','Led 2023 acquisition out of administration; massive Australia-Singapore solar export project'),
      jsonb_build_object('company','AGL Energy','context','Significant stakeholder; pushed for accelerated coal-plant retirement'),
      jsonb_build_object('company','Atlassian','context','Co-Founder, Co-CEO; NASDAQ-listed software giant')
    ),
    'sources', jsonb_build_object(
      'twitter_list','https://twitter.com/i/lists/7',
      'grok_ventures','https://www.grok.ventures/',
      'atlassian','https://www.atlassian.com/'
    ),
    'corrections','CSV LinkedIn empty; Atlassian/Grok Ventures public profile is the canonical source.'
  ),
  updated_at = now()
WHERE name = 'Mike Cannon-Brookes';

UPDATE investors SET
  description = 'Sydney-based angel investor with stated focus on ClimateTech, EdTech and MedTech. Limited public investor profile beyond Australian angel directory listing — sector-focused emerging angel.',
  basic_info = 'Muhilan Sriravindrarajah is a Sydney-based angel investor with stated focus on **ClimateTech, EdTech and MedTech**. He is listed in the Australian angel investor directory but his individual investment track record could not be uniquely corroborated from public-source search.

The sector mix — climate-tech, education-tech and medical-tech — suggests a mission/impact-aligned thesis.',
  why_work_with_us = 'For Australian climate-tech, ed-tech and med-tech founders looking for a Sydney-based emerging angel with mission/impact-aligned thesis. Best treated as a referral- or warm-intro-led conversation given limited public profile.',
  sector_focus = ARRAY['ClimateTech','EdTech','MedTech','HealthTech','Impact'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/muhilans',
  contact_email = 'muhilan_s@hotmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Muhilan Sriravindrarajah — Sydney Climate/Ed/MedTech Angel',
  meta_description = 'Sydney-based angel. ClimateTech, EdTech, MedTech focus.',
  details = jsonb_build_object(
    'investment_thesis','ClimateTech, EdTech, MedTech.',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/muhilans'
    ),
    'corrections','CSV LinkedIn URL had no protocol prefix.'
  ),
  updated_at = now()
WHERE name = 'Muhilan Sriravindrarajah';

COMMIT;
