-- Phase 5.3 Batch 2 (6/9): Palantir AU market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'palantir-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY['US-founded 2003 (Palo Alto); HQ Denver since 2020, Miami announced Feb 2026','Australian Defence has used Palantir software since 2011; AusTender from 2013','Mike Kelly (ex-Defence Materiel Minister) joined Palantir AU after 2020 retirement','Paul Rawlins serves as General Manager Australia / Head of Public Sector','Canberra HQ + Sydney/Melbourne offices; over $60M federal contracts since 2013'],
    quick_facts = '[{"label":"AU Entry Year","value":"2011 (Defence software in use)","icon":"Calendar"},{"label":"AU Headquarters","value":"Canberra (+ Sydney, Melbourne)","icon":"MapPin"},{"label":"AU GM","value":"Paul Rawlins, Head of Public Sector AU","icon":"User"},{"label":"Named AU Customers","value":"Defence, ASD, ACIC, AUSTRAC, NSW Crime Commission","icon":"Building"},{"label":"Cumulative Federal Contracts","value":">$60M since 2013","icon":"DollarSign"},{"label":"Origin","value":"US — founded 2003, HQ Denver","icon":"Globe2"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Crikey — Defence signs biggest ever contract with Palantir for Cyber Warfare Division', 'https://www.crikey.com.au/2026/02/17/australian-defence-department-palantir-biggest-ever-contract/', '2026-05-04', 'news', 1),
    (v_case_study_id, 'Michael West Media — Spy firm Palantir secures top Australian security clearance', 'https://michaelwest.com.au/we-kill-enemies-spy-firm-palantir-secures-top-australian-security-clearance/', '2026-05-04', 'news', 2),
    (v_case_study_id, 'Crikey — Palantir helped Australian intelligence agency sort 42m data points', 'https://www.crikey.com.au/2026/04/27/palantir-australia-manual-gotham-intelligence-agency-acic/', '2026-05-04', 'news', 3),
    (v_case_study_id, 'Canberra Times — Defence skips competitive tender to award Palantir multimillion-dollar contract', 'https://www.canberratimes.com.au/story/9178631/defence-awards-palantir-76m-defence-contract/', '2026-05-04', 'news', 4),
    (v_case_study_id, 'Canberra Times — Mike Kelly defends new role with Palantir', 'https://www.canberratimes.com.au/story/6752504/mike-kelly-defends-new-role-with-palantir-after-quitting-parliament-due-to-health-issues/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Canberra Times — Who is Palantir, the US tech company Mike Kelly now works for?', 'https://www.canberratimes.com.au/story/6753280/who-is-palantir-the-us-tech-company-mike-kelly-now-works-for/', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Canberra Times — AUSTRAC awards Palantir $5.06m deal in non-competitive tender', 'https://www.canberratimes.com.au/story/9231465/austrac-awards-palantir-506m-deal-in-non-competitive-tender/', '2026-05-04', 'news', 7),
    (v_case_study_id, 'Australian Defence Magazine — EOS and Palantir Australia partner on space operations exercise', 'https://www.australiandefence.com.au/defence/cyber-space/eos-and-palantir-australia-partner-on-space-operations-exercise', '2026-05-04', 'news', 8),
    (v_case_study_id, 'Palantir Investor Relations — Palantir Achieves IRAP PROTECTED Level', 'https://investors.palantir.com/news-details/2025/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia/', '2026-05-04', 'press_release', 9),
    (v_case_study_id, 'AusTender Contract Notice CN4104368 — Defence / Palantir', 'https://www.tenders.gov.au/Cn/Show/abce7d48-265e-4b3c-aa77-7fbc197e84f2', '2026-05-04', 'government', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'I have been fortunate to be able to take up a job offer with Palantir Technologies Australia that will enable me to work within my physical limitations but still be in a position to make a difference in relation to the issues that matter to me.', 'Mike Kelly', 'Former Australian Minister for Defence Materiel; later Palantir Australia', 'https://www.canberratimes.com.au/story/6752504/mike-kelly-defends-new-role-with-palantir-after-quitting-parliament-due-to-health-issues/', 'Canberra Times', 1),
    (v_case_study_id, v_sec_success, 'They provide tools to manage information and enable people and organisations to make the best use of the data they lawfully gather and manage.', 'Mike Kelly', 'Former Federal MP (Eden-Monaro); later Palantir Australia', 'https://www.canberratimes.com.au/story/6752504/mike-kelly-defends-new-role-with-palantir-after-quitting-parliament-due-to-health-issues/', 'Canberra Times', 2),
    (v_case_study_id, v_sec_success, 'Achieving IRAP PROTECTED level is a testament to Palantir''s unwavering commitment to security and compliance.', 'Paul Rawlins', 'Head of Public Sector, Australia, Palantir Technologies', 'https://investors.palantir.com/news-details/2025/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia/', 'Palantir Investor Relations', 3),
    (v_case_study_id, v_sec_metrics, 'Companies like Palantir, for example, effectively vectored Osama Bin Laden''s location, so these are companies and capabilities that we need to work with.', 'Mike Kelly', 'Then-Federal MP (Eden-Monaro), Shadow Assistant Minister for Defence', 'https://www.canberratimes.com.au/story/6753280/who-is-palantir-the-us-tech-company-mike-kelly-now-works-for/', 'Canberra Times', 4),
    (v_case_study_id, v_sec_lessons, 'I am excited about the platform that we are developing together with Palantir.', 'Craig Smith', 'CEO, EOS Space Systems', 'https://www.australiandefence.com.au/defence/cyber-space/eos-and-palantir-australia-partner-on-space-operations-exercise', 'Australian Defence Magazine', 5),
    (v_case_study_id, v_sec_lessons, 'They are one of the great Australian stories in terms of their remarkable innovation.', 'Mike Kelly', 'Palantir Australia (on EOS Space Systems partnership)', 'https://www.australiandefence.com.au/defence/cyber-space/eos-and-palantir-australia-partner-on-space-operations-exercise', 'Australian Defence Magazine', 6);
END $$;
