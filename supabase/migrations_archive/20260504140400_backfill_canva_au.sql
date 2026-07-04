-- Phase 5.3 Batch 2 (5/9): Canva Australian design dominance backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_challenges uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'canva-australian-design-dominance';
  IF v_case_study_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_sec_entry      FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_challenges FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'challenges-faced';
  SELECT id INTO v_sec_lessons    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY['Founded January 2013 in Perth by Perkins, Obrecht, Adams','Sydney HQ; 230M+ monthly active users across 190 countries','Valued US$32B in October 2024 secondary share sale','Acquired UK''s Affinity (Serif) March 2024 for B2B push','Launched Visual Suite 2.0 at Canva Create April 2025'],
    quick_facts = '[{"label":"Founded","value":"2013, Perth (now Sydney HQ)","icon":"Calendar"},{"label":"Founders","value":"Perkins, Obrecht, Adams","icon":"Users"},{"label":"Valuation","value":"US$32B (Oct 2024 secondary)","icon":"TrendingUp"},{"label":"Monthly Active Users","value":"230M+ across 190 countries","icon":"Globe2"},{"label":"Employees","value":"~5,000 globally (2024)","icon":"Building"},{"label":"Origin","value":"Australia (WA / Sydney HQ)","icon":"MapPin"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Wikipedia — Canva', 'https://en.wikipedia.org/wiki/Canva', '2026-05-04', 'other', 1),
    (v_case_study_id, 'BusinessWire — Canva Acquires Design Platform Affinity', 'https://www.businesswire.com/news/home/20240325965656/en/Canva-Acquires-Design-Platform-Affinity-to-Bring-Professional-Design-Tools-to-Every-Organization', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'BusinessWire — Canva''s Biggest Launch Yet: Visual Suite 2.0', 'https://www.businesswire.com/news/home/20250410082173/en/Canvas-Biggest-Launch-Yet-Introduces-Visual-Suite-2.0-to-Redefine-Creativity-and-Productivity', '2026-05-04', 'press_release', 3),
    (v_case_study_id, 'Canva Newsroom — Affinity acquisition', 'https://www.canva.com/newsroom/news/affinity/', '2026-05-04', 'company_blog', 4),
    (v_case_study_id, 'Canva Newsroom — Step Two: Impact', 'https://www.canva.com/newsroom/news/step-two-impact/', '2026-05-04', 'company_blog', 5),
    (v_case_study_id, 'Pledge 1% — Canva $40B valuation, founder pledge', 'https://www.pledge1percent.org/canva-raises-at-40-billion-valuation-its-founders-are-pledging/', '2026-05-04', 'other', 6),
    (v_case_study_id, 'Inc. — How Melanie Perkins learned to pitch persuasively', 'https://www.inc.com/carmine-gallo/how-canvas-melanie-perkins-learned-to-pitch-persuasively-after-more-than-100-rejections.html', '2026-05-04', 'news', 7),
    (v_case_study_id, 'Creator Economy — Cameron Adams AI playbook', 'https://creatoreconomy.so/p/canva-co-founder-ai-playbook-most-popular-design-tool-cameron-adams', '2026-05-04', 'interview', 8),
    (v_case_study_id, 'Spatial Intelligence — How Canva built a $32B design empire', 'https://www.spatialintelligence.ai/p/how-canva-built-a-32b-design-empire', '2026-05-04', 'interview', 9),
    (v_case_study_id, 'Canva Newsroom — Cameron Adams biggest lessons', 'https://www.canva.com/newsroom/news/canva-founder-cameron-adams-biggest-lessons/', '2026-05-04', 'company_blog', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'You had tools that 1% of the world could possibly use. So we set out to create this product that enabled the other 99% of the world to access design.', 'Cameron Adams', 'Co-founder & Chief Product Officer, Canva', 'https://www.spatialintelligence.ai/p/how-canva-built-a-32b-design-empire', 'Spatial Intelligence', 1),
    (v_case_study_id, v_sec_entry, 'Giving them easy access to the tool through their web browser and letting them get up to speed in seconds, not months, was a really critical part of helping Canva grow in the early days.', 'Cameron Adams', 'Co-founder & Chief Product Officer, Canva', 'https://www.spatialintelligence.ai/p/how-canva-built-a-32b-design-empire', 'Spatial Intelligence', 2),
    (v_case_study_id, v_sec_success, 'We''re thrilled to unveil the Visual Suite 2.0 where creativity meets productivity, the biggest product launch since Canva was founded more than a decade ago.', 'Melanie Perkins', 'Co-founder & CEO, Canva', 'https://www.businesswire.com/news/home/20250410082173/en/Canvas-Biggest-Launch-Yet-Introduces-Visual-Suite-2.0-to-Redefine-Creativity-and-Productivity', 'BusinessWire', 3),
    (v_case_study_id, v_sec_metrics, 'We''ve got now 240 million people that use the product every month, and they use it for an incredible variety of things.', 'Cameron Adams', 'Co-founder & Chief Product Officer, Canva', 'https://www.spatialintelligence.ai/p/how-canva-built-a-32b-design-empire', 'Spatial Intelligence', 4),
    (v_case_study_id, v_sec_challenges, 'Visual communication is now ubiquitous in the workplace and investing in strategies that enhance our B2B offerings is core to the future of our business.', 'Cliff Obrecht', 'Co-founder & COO, Canva', 'https://www.businesswire.com/news/home/20240325965656/en/Canva-Acquires-Design-Platform-Affinity-to-Bring-Professional-Design-Tools-to-Every-Organization', 'BusinessWire', 5),
    (v_case_study_id, v_sec_lessons, 'I truly believed that putting design in the hands of everyone will have an amazingly positive impact on their lives and their world.', 'Cameron Adams', 'Co-founder & Chief Product Officer, Canva', 'https://creatoreconomy.so/p/canva-co-founder-ai-playbook-most-popular-design-tool-cameron-adams', 'Creator Economy', 6);
END $$;
