-- Report-quality loop — Phase B: anti-bulk prompt tightening.
--
-- Implements four human-approved proposals from report_quality_proposals:
--   4141b260 — cap action_plan length, bullet-only phases, strip exec-summary restate
--   b6181ab4 — action_plan: suppress generic filler / AI-tells, keep it concrete
--   b42df841 — investor_recommendations: strict investor framing + tight length
--   e0f19af9 — directory sections: card format + per-record hyperlinks, no walls of text
--
-- Implementation: append authoritative directive blocks to the existing
-- report_templates bodies (later instructions constrain the model without rewriting the
-- whole prompt) and bump each touched template's version. Idempotent — each UPDATE is
-- guarded on a marker so re-running is a no-op. Reversible — strip the appended blocks.
-- Templates are DB-driven (no code change); this is propose-only work shipped behind PR
-- review, not auto-applied to prod.

-- action_plan — length cap, bullet-only phases, no restate, no filler (4141b260, b6181ab4)
update public.report_templates
set prompt_body = prompt_body || $b$

--- FORMAT & LENGTH (report-quality) ---
- Keep this whole section under 500 words. Write each phase as bullet points, not paragraphs.
- Open directly with Phase 1 — do NOT restate the executive summary or add scene-setting preamble.
- Every bullet must cite something concrete from the data above (a named provider, regulation, cost figure, grant, or target region). Cut generic filler and transition phrases such as "In today's competitive landscape", "It is important to note", or "As mentioned above".$b$,
    version = version + 1
where section_name = 'action_plan' and is_active = true
  and position('--- FORMAT & LENGTH' in prompt_body) = 0;

-- investor_recommendations — strict investor framing + tight length (b42df841, 4141b260)
update public.report_templates
set prompt_body = prompt_body || $b$

--- FORMAT & LENGTH (report-quality) ---
- Keep this whole section under 250 words.
- Frame every entry strictly as an INVESTOR / capital provider — never as a distribution partner, channel partner, reseller, or customer.
- Render each investor as one compact bullet: bold name, one sentence on why they fit, then the check-size range. Maximum 2 sentences per investor. Cut any narrative that restates the executive summary.$b$,
    version = version + 1
where section_name = 'investor_recommendations' and is_active = true
  and position('--- FORMAT & LENGTH' in prompt_body) = 0;

-- directory sections — card format + per-record hyperlinks, no walls of text (e0f19af9)
update public.report_templates
set prompt_body = prompt_body || $b$

--- PRESENTATION RULES (report-quality) ---
- Present matched records as scannable cards, not walls of text: one record per bullet, maximum 3 sentences each.
- Where a record carries a website or profile link (its website, link, or url field), hyperlink the record's name in markdown as [Name](url). If no link is present, bold the name instead. Never invent or guess URLs.
- Do not repeat the same record across multiple paragraphs, and do not pad entries with generic commentary.$b$,
    version = version + 1
where section_name in ('service_providers','mentor_recommendations','events_resources','investor_recommendations','lead_list')
  and is_active = true
  and position('--- PRESENTATION RULES' in prompt_body) = 0;
