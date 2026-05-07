-- Enrich angel investors — batch 02w (records 134-138: Kevin O'Hara → Landon Kahn)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based 3x exited founder turned VC and angel investor. Co-Founder & CEO of Trivian Capital and Sentor Investments (Sydney boutique principal investment firm focused on growth-stage ASEAN). Venture Partner at Primal Capital (UK), SDGx (Singapore), Newzone Ventures (Portugal). MBA + INSEAD + Harvard Business School postgrad. $50k–$250k cheques.',
  basic_info = 'Kevin O''Hara is a Sydney-based 3x exited founder turned Angel and Venture Capitalist with one of the most internationally-distributed VC affiliation networks in the Australian scene.

His operating background: founded and exited 3 successful Australian startups to private equity. Then completed an MBA with a major in Digital Transformation, plus postgraduate studies at both **INSEAD** and **Harvard Business School**.

His current investment roles:
- **Co-Founder & CEO of Trivian Capital**
- **Sentor Investments** (Sydney boutique principal investment firm, founded 2015) — venture capital, private equity, digital assets, pre-IPO and listed equity across Australia, Israel, Asia, Europe and US. Particular focus on growth-capital opportunities in ASEAN.
- **Investment Committee Member + Venture Partner, Primal Capital (UK)**
- **Venture Partner, SDGx (Singapore)**
- **Investment Committee Member, Newzone Ventures (Portugal)**

CSV-listed portfolio: **Internet 2.0** (cybersecurity), **Immersve** and additional truncated names. CSV cheque size $50k–$250k.',
  why_work_with_us = 'For Australian founders with international scale ambitions across ASEAN, UK, Singapore or Portugal, Kevin offers an unusually globally-distributed cheque-and-syndication footprint plus 3x exited-founder operator credentials.',
  sector_focus = ARRAY['SaaS','Cybersecurity','FinTech','Crypto','DeepTech','Generalist','Cross-border'],
  stage_focus = ARRAY['Seed','Series A','Series B','Growth'],
  check_size_min = 50000,
  check_size_max = 250000,
  linkedin_url = 'https://www.linkedin.com/in/kevino23/',
  contact_email = 'kevin@sentorinvestments.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Trivian Capital (Co-Founder & CEO)','Sentor Investments (founded 2015)','Primal Capital UK (Venture Partner + IC Member)','SDGx Singapore (Venture Partner)','Newzone Ventures Portugal (IC Member)','Internet 2.0','Immersve'],
  meta_title = 'Kevin O''Hara — Trivian / Sentor / Primal | Sydney Globally-Networked Angel',
  meta_description = 'Sydney 3x exited founder. CEO Trivian Capital + Sentor Investments. VP Primal Capital UK, SDGx Singapore, Newzone Portugal. $50k–$250k.',
  details = jsonb_build_object(
    'founder_history','3 prior Australian startup exits to private equity',
    'current_roles', ARRAY[
      'Co-Founder & CEO, Trivian Capital',
      'Sentor Investments (Sydney; founded 2015)',
      'IC Member + Venture Partner, Primal Capital (UK)',
      'Venture Partner, SDGx (Singapore)',
      'IC Member, Newzone Ventures (Portugal)'
    ],
    'education', ARRAY['MBA (Digital Transformation major)','INSEAD postgraduate','Harvard Business School postgraduate'],
    'check_size_note','$50k–$250k',
    'sources', jsonb_build_object(
      'sentor_crunchbase','https://www.crunchbase.com/organization/sentor-investments-4e2c',
      'sentor_cb_insights','https://www.cbinsights.com/investor/sentor-investments',
      'trivian','https://www.triviancapital.com/team',
      'linkedin','https://au.linkedin.com/in/kevino23',
      'wellfound','https://wellfound.com/p/kevin-sentorinvestments-com-au'
    ),
    'corrections','CSV portfolio truncated. Two retained verbatim plus expanded firm affiliations. CSV email truncated ("kevin@sentorinvestments..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Kevin O''Hara';

UPDATE investors SET
  description = 'Sydney-based serial entrepreneur and angel investor. Founder of Modibodi (period-and-leakage underwear; sold to Essity 2022 for ~AU$140M after 10 years CEO). OAM. Now investing and advising female-owned, social-impact-led businesses incl. Laronix, PeopleBench, Clean Slate Clinic, Human Health, Revibe, E-Leviate, Matched, Everty. $50k–$150k cheques.',
  basic_info = 'Kristy Chong OAM is a Sydney-based serial entrepreneur and angel investor with one of the most-cited Australian female-founder exit stories. She is the founder of **Modibodi** — the period-and-leakage underwear brand she built into a category-defining business and sold to global health company **Essity** in 2022 for ~AU$140M after 10 years as CEO.

She is now dedicating her time to investing in and advising **female-owned, social-impact-led businesses**. Verified portfolio:
- **Laronix** (AI-powered voice-loss tech)
- **PeopleBench** (HR/people analytics for schools)
- **Clean Slate Clinic** (digital alcohol-treatment)
- **Human Health**
- **Revibe**
- **E-Leviate**
- **Matched**
- **Everty** (EV charging digital tech)
- **SBE Growth Advisory**

She is openly biased toward female-founded businesses and has stated "I have a conscious bias" — she actively wants to see more female entrepreneurs.',
  why_work_with_us = 'For Australian female-founded sustainability, health, social-impact and consumer brands, Kristy offers one of the highest-leverage cheques in the country — combining Modibodi''s $140M exit operator credentials, OAM-level public profile and an explicit female-founder bias.',
  sector_focus = ARRAY['Sustainability','Health','Female Founders','Social Impact','Consumer','HealthTech','EnergyTech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 150000,
  linkedin_url = 'https://www.linkedin.com/in/kristy-chong-oam-3b21357/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Modibodi (Founder, ex-CEO; Essity exit 2022, AU$140M)','Laronix','PeopleBench','Clean Slate Clinic','Human Health','Revibe','E-Leviate','Matched','Everty','SBE Growth Advisory'],
  meta_title = 'Kristy Chong OAM — Modibodi founder | Sydney Female-Founder Angel',
  meta_description = 'Sydney founder Modibodi (Essity $140M exit 2022). OAM. Female-founded social-impact angel. Laronix, PeopleBench, Clean Slate Clinic, Everty. $50k–$150k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Modibodi (Founder, ex-CEO 10 years; Essity exit 2022, ~AU$140M)'],
    'recognition', ARRAY['OAM (Order of Australia Medal)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Modibodi','category','Period-and-leakage underwear','acquirer','Essity (global health)','year',2022,'value_aud','~$140M','tenure','10 years CEO')
    ),
    'investment_thesis','Female-owned, social-impact-led businesses with sustainability and health focus. Conscious female-founder bias.',
    'verified_portfolio', ARRAY['Laronix','PeopleBench','Clean Slate Clinic','Human Health','Revibe','E-Leviate','Matched','Everty','SBE Growth Advisory'],
    'check_size_note','$50k–$150k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/kristy-chong-oam-3b21357/',
      'sydney_uni','https://www.sydney.edu.au/news-opinion/news/2023/10/09/breaking-with-taboo.html',
      'smartcompany_modibodi','https://www.smartcompany.com.au/entrepreneurs/kristy-chong-unmentionable-modibodi/',
      'theorg_clean_slate','https://theorg.com/org/clean-slate-clinic/org-chart/kristy-chong-oam',
      'allbright','https://www.allbrightcollective.com/edit/articles/heres-how-modibodis-kristy-chong-disrupted-an-entire-market-category',
      'giant_leap','https://www.giantleap.com.au/blog-posts/a-founders-guide-to-educating-the-market-and-scaling-towards-exit---with-modibodis-kristy-chong'
    ),
    'corrections','CSV portfolio truncated ("Laronix, PeopleBench, Ev..."). Expanded with verified investments from public sources.'
  ),
  updated_at = now()
WHERE name = 'Kristy Chong';

UPDATE investors SET
  description = 'Sydney-based Co-Founder and Partner at Flying Fox Ventures (early-stage AU/NZ syndicate, ~$5M/yr deployment). Founder of Eleanor Venture (predecessor early-stage VC). 20+ years in technology capital raising and M&A across AU, Asia, US. LLB(Hons), BA(Int Studies), AGSM Change Mgmt, Harvard leadership. 55+ portfolio incl. Josef, Fresh Equities, Jig Space, Goterra, Mr Yum, Heaps Normal, Butter Insurance. $150K cheques.',
  basic_info = 'Kylie Frazer is a Sydney-based Co-Founder and Partner at **Flying Fox Ventures** — the early-stage Australian and NZ syndicate she co-founded with Rachael Neumann (separately listed as record #83) targeting ~$5M/year deployment across early-stage AU/NZ technology businesses.

Before Flying Fox, she founded **Eleanor Venture** — an early-stage VC firm that made it easy for private investors to build their own diversified technology portfolios, with portfolio companies including Fresh Equities, Jig Space and Goterra.

Combined Flying Fox + Eleanor Venture portfolio runs to **55+ companies** with ~$30M deployed. Notable holdings: **Josef, Fresh Equities, Jig Space, Goterra, Mr Yum, Heaps Normal, Butter Insurance** and many more.

In 2024 Flying Fox tapped investors for a new $20M fund.

She brings 20+ years of experience in technology capital raising and M&A across Australia, Asia and the United States. Education: **LLB (Hons) and BA (International Studies)**, postgraduate Change Management at AGSM, leadership studies at Harvard Business School. CSV cheque size $150K.',
  why_work_with_us = 'For Australian and NZ early-stage founders, Kylie is among the most institutionally rigorous angel-syndicate operators — Flying Fox combines fund-style discipline with syndicate accessibility and her 20+ years of capital-raising/M&A pattern recognition.',
  sector_focus = ARRAY['SaaS','Marketplace','FinTech','LegalTech','EdTech','Consumer','HealthTech','Climate'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 150000,
  check_size_max = 150000,
  website = 'https://www.flyingfox.vc',
  linkedin_url = 'https://www.linkedin.com/in/kylie-frazer-6331407a/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Flying Fox Ventures (Co-Founder & Partner, with Rachael Neumann #83)','Eleanor Venture (Founder)','Josef','Fresh Equities','Jig Space','Goterra','Mr Yum','Heaps Normal','Butter Insurance'],
  meta_title = 'Kylie Frazer — Flying Fox Ventures Co-Founder | Sydney Syndicate Angel',
  meta_description = 'Sydney Co-Founder Flying Fox Ventures (~$5M/yr). Founder Eleanor Venture. 55+ portfolio. Josef, Goterra, Mr Yum, Heaps Normal. $150K.',
  details = jsonb_build_object(
    'firms', ARRAY[
      'Flying Fox Ventures (Co-Founder & Partner; with Rachael Neumann #83)',
      'Eleanor Venture (Founder)'
    ],
    'experience_years','20+ years technology capital raising and M&A (AU/Asia/US)',
    'education', ARRAY['LLB (Hons), University of Sydney','BA (International Studies)','Postgraduate Change Management, AGSM','Leadership studies, Harvard Business School'],
    'portfolio_count','55+ companies, ~$30M deployed',
    'highlight_investments', ARRAY['Josef','Fresh Equities','Jig Space','Goterra','Mr Yum','Heaps Normal','Butter Insurance'],
    'check_size_note','$150K',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/kylie-frazer-6331407a',
      'crunchbase','https://www.crunchbase.com/person/kylie-frazer',
      'flying_fox','https://www.flyingfox.vc/',
      'business_news_au_20m','https://www.businessnewsaustralia.com/articles/-we-feel-really-confident---early-stage-vc-firm-flying-fox-ventures-taps-investors-for-new--20m-fund.html',
      'on_impact','https://onimpact.com.au/flying-fox-ventures-its-not-vc-its-a-master-class-in-angel-investing/',
      'pioneera_take_5','https://pioneera.com/content/blog/take-5-kylie-frazer'
    ),
    'corrections','CSV portfolio truncated ("Josef, Fresh Equities, Jig..."). Expanded with verified Flying Fox/Eleanor portfolio from public sources.'
  ),
  updated_at = now()
WHERE name = 'Kylie Frazer';

UPDATE investors SET
  description = 'Sydney-based serial consumer-brand entrepreneur and angel investor. Co-Founder of Yes To Inc (one of largest US natural-beauty brands) and Yoobi (school supplies). Co-founder of Cheeky Home (tableware with meal donation). Ex-Chairman Bellabox (Feb 2013-Jan 2019). Advisor + Investor RangeMe (2015-2017). Chairman district8.',
  basic_info = 'Lance Kalish is a Sydney-based serial entrepreneur and consumer-products angel investor. He is best known as Co-Founder of:
- **Yes To Inc** (with Ido Leffler) — one of the largest natural-beauty brands in the United States.
- **Yoobi** — school-supplies social-enterprise that provides supplies to underprivileged children.
- **Cheeky Home** — colourful tableware brand with meal-donation model.

His angel portfolio centre-of-mass is consumer goods. Notable positions:
- **Bellabox** (Australian beauty subscription) — Series A investor January 2013; Chairman February 2013 – January 2019.
- **RangeMe** (B2B retail-product discovery; acquired by Emerge Commerce) — Advisor + Investor January 2015 – July 2017.
- **district8** — Chairman.',
  why_work_with_us = 'For Australian and global consumer-goods, beauty, household and social-enterprise founders, Lance offers exit-tested consumer-brand operating credentials (Yes To Inc, Yoobi, Cheeky Home) plus 6+ years of Bellabox chairmanship.',
  sector_focus = ARRAY['Consumer','Consumer Goods','Beauty','Household','Social Enterprise','Retail Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/lance-kalish-1555b/',
  contact_email = 'lance.kalish@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Yes To Inc (Co-Founder)','Yoobi (Co-Founder, Chairman, CFO)','Cheeky Home (Co-Founder)','Bellabox (ex-Chairman 2013-2019)','RangeMe (Advisor + Investor 2015-2017)','district8 (Chairman)'],
  meta_title = 'Lance Kalish — Yes To Inc / Yoobi / Bellabox | Sydney Consumer Angel',
  meta_description = 'Sydney consumer-brand serial founder. Co-Founder Yes To Inc, Yoobi, Cheeky Home. Ex-Chairman Bellabox. RangeMe advisor.',
  details = jsonb_build_object(
    'co_founder_of', ARRAY['Yes To Inc (US natural-beauty brand)','Yoobi (school supplies social enterprise)','Cheeky Home (colourful tableware with meal donation)'],
    'past_chairman_roles', ARRAY['Bellabox (Feb 2013 - Jan 2019)','district8'],
    'past_advisor_roles', ARRAY['RangeMe (Advisor + Investor; Jan 2015 - Jul 2017)'],
    'investment_thesis','Consumer goods, beauty, household, retail-tech and social-enterprise.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/lance-kalish-1555b/',
      'crunchbase','https://www.crunchbase.com/person/lance-kalish',
      'pitchbook','https://pitchbook.com/profiles/investor/224336-08',
      'theorg_yoobi','https://theorg.com/org/yoobi/org-chart/lance-kalish',
      'smartcompany_yes_to','https://www.smartcompany.com.au/entrepreneurs/ido-leffler-australia-successful-entrepreneurs-adam-schwab/',
      'wikipedia_ido_leffler','https://en.wikipedia.org/wiki/Ido_Leffler'
    ),
    'corrections','CSV portfolio truncated ("Bellabox, RangeMe, Beac..."). Two verified retained; trailing item could not be uniquely identified. Added Yes To Inc, Yoobi, Cheeky Home, district8 from verified founder/chairman roles.'
  ),
  updated_at = now()
WHERE name = 'Lance Kalish';

UPDATE investors SET
  description = 'Sydney-based climate-tech and impact angel investor. NetZero & Energy Transition Consultant and Business Advisor. 13 angel investments to date. $5k–$20k cheques. Active in Australian climate-tech investor community.',
  basic_info = 'Landon Kahn is a Sydney-based **NetZero & Energy Transition Consultant**, business advisor and angel investor with an explicit Climatetech and Impact thesis.

Per the CSV directory, he has made **13 angel investments to date** with cheque sizes of $5k–$20k. He is active in the Australian climate-tech investor community and has a regular public profile via LinkedIn on solar, EV and renewable-energy themes.

Beyond the directory entry and his consulting/advisor practice, individual portfolio details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian climate-tech, energy-transition and impact-led founders, Landon offers a small first cheque ($5k–$20k) plus NetZero/energy-transition consulting expertise.',
  sector_focus = ARRAY['Climate Tech','Impact','Energy Transition','NetZero','Renewables','Solar','EV'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/landonkahn',
  contact_email = 'hello@landonkahn.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['NetZero & Energy Transition consulting practice','13 climate-tech angel investments to date'],
  meta_title = 'Landon Kahn — Sydney Climate-Tech Angel | $5k–$20k',
  meta_description = 'Sydney NetZero & Energy Transition Consultant. Climate Tech and Impact angel. 13 investments. $5k–$20k.',
  details = jsonb_build_object(
    'professional_role','NetZero & Energy Transition Consultant + Business Advisor',
    'investment_count','13 (per CSV)',
    'investment_thesis','Climate Tech and Impact early-stage Australian businesses.',
    'check_size_note','$5k–$20k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual portfolio companies could not be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/landonkahn',
      'climate_salad_investors','https://www.climatesalad.com/climate-tech-angel-investors-australia',
      'climate_angels','https://www.climateangels.vc',
      'flashlabs','https://www.flashlabs.ai/people/Landon-Kahn-b9d2da9965ac41417cb164036d742440/'
    ),
    'corrections','CSV portfolio "13 investments so far" — interpreted as count rather than literal portfolio names.'
  ),
  updated_at = now()
WHERE name = 'Landon Kahn';

COMMIT;
