// Report-quality telemetry + scoring. Imported by slack-notify/index.ts.
// Deterministic layers (utilization, presentation) + an LLM "substance" judge via the Lovable
// AI Gateway (Gemini). Substance is computed once per report and cached on the report_quality row.

const REPORT_BASE_URL = "https://market-entry-secrets.lovable.app/report";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const AI_MODEL = "google/gemini-3-flash-preview";

const RAG_SOURCES = [
  "service_providers", "community_members", "events", "content_items",
  "leads", "innovation_ecosystem", "trade_investment_agencies", "investors",
];
const RAG_LABELS: Record<string, string> = {
  service_providers: "Providers", community_members: "Mentors", events: "Events", content_items: "Content",
  leads: "Leads", innovation_ecosystem: "Innovation", trade_investment_agencies: "Agencies", investors: "Investors",
};
const BAND = (s: number) => (s >= 80 ? { e: "🟢", c: "#2eb67d" } : s >= 60 ? { e: "🟡", c: "#ECB22E" } : { e: "🔴", c: "#e01e5a" });

function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }
function wc(s: string): number { return s ? s.trim().split(/\s+/).filter(Boolean).length : 0; }
function logErr(where: string, detail: unknown): void { console.error(`[slack-notify:rq] ${where}:`, detail); }

// deno-lint-ignore no-explicit-any
function entityName(e: any): string {
  return String(e?.name ?? e?.title ?? e?.company_name ?? e?.company ?? "").toLowerCase().trim();
}

// deno-lint-ignore no-explicit-any
function computeUtilization(rj: any) {
  const matches = rj.matches ?? {};
  const sections = rj.sections ?? {};
  const visIds = new Set<string>(), visNames = new Set<string>();
  const hidIds = new Set<string>(), hidNames = new Set<string>();
  let prose = "";
  for (const [, v] of Object.entries(sections) as [string, { visible?: boolean; content?: string; matches?: unknown[] }][]) {
    const ids = v?.visible ? visIds : hidIds;
    const names = v?.visible ? visNames : hidNames;
    if (v?.visible) prose += " " + (v.content || "");
    if (Array.isArray(v?.matches)) {
      for (const m of v.matches) {
        // deno-lint-ignore no-explicit-any
        const mm = m as any;
        if (mm?.id) ids.add(String(mm.id));
        const nm = entityName(mm);
        if (nm) names.add(nm);
      }
    }
  }
  const proseLc = prose.toLowerCase();

  const per: Record<string, { surfaced: number; used: number; gated: number; dropped: number }> = {};
  let surfacedTotal = 0, usedTotal = 0;
  for (const cat of RAG_SOURCES) {
    const arr = Array.isArray(matches[cat]) ? matches[cat] : [];
    let used = 0, gated = 0;
    for (const e of arr) {
      const id = e?.id ? String(e.id) : "";
      const nm = entityName(e);
      const inVisible = (id && visIds.has(id)) || (nm && (visNames.has(nm) || (nm.length >= 5 && proseLc.includes(nm))));
      const inHidden = (id && hidIds.has(id)) || (nm && hidNames.has(nm));
      if (inVisible) used++;
      else if (inHidden) gated++;
    }
    const dropped = arr.length - used - gated;
    per[cat] = { surfaced: arr.length, used, gated, dropped };
    surfacedTotal += arr.length; usedTotal += used;
  }
  const rate = surfacedTotal ? usedTotal / surfacedTotal : null;
  const dropped = RAG_SOURCES.filter((c) => per[c].dropped > 0);
  const gated = RAG_SOURCES.filter((c) => per[c].gated > 0 && per[c].used === 0);
  return { per, surfacedTotal, usedTotal, rate, dropped, gated };
}

// deno-lint-ignore no-explicit-any
function computePresentation(rj: any) {
  const sections = rj.sections ?? {};
  const texts = (Object.entries(sections) as [string, { visible?: boolean; content?: string }][])
    .filter(([, v]) => v?.visible && (v.content || "").trim().length > 0)
    .map(([k, v]) => ({ k, c: v.content || "" }));
  const fullProse = texts.map((t) => t.c).join("\n");
  const totalWords = wc(fullProse);

  const links = [...fullProse.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  const linkCount = links.length;
  const placeholderLinks = links.filter((u) => /example\.com|localhost|\bTODO\b/i.test(u)).length;
  const citationMarkers = (fullProse.match(/\[\d+\]/g) || []).length;
  const citationDensity = totalWords ? (citationMarkers + linkCount) / (totalWords / 1000) : 0;

  const tellRe = /(as an ai|i cannot|\[insert|\[todo|lorem ipsum|xyz company|placeholder|\btbd\b)/i;
  const tells = texts.filter((t) => tellRe.test(t.c)).map((t) => t.k);

  const wallSections: string[] = [];
  for (const t of texts) {
    if (t.c.split(/\n\s*\n/).some((p) => wc(p) > 180)) wallSections.push(t.k);
  }

  const shingle = (s: string) => {
    const w = s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i + 4 <= w.length; i++) set.add(w.slice(i, i + 4).join(" "));
    return set;
  };
  const shs = texts.map((t) => ({ k: t.k, sh: shingle(t.c) }));
  const dupPairs: string[] = [];
  for (let i = 0; i < shs.length; i++) {
    for (let j = i + 1; j < shs.length; j++) {
      const a = shs[i].sh, b = shs[j].sh;
      if (a.size < 10 || b.size < 10) continue;
      let inter = 0; for (const x of a) if (b.has(x)) inter++;
      if (inter / Math.min(a.size, b.size) > 0.25) dupPairs.push(`${shs[i].k}~${shs[j].k}`);
    }
  }

  const lengths = texts.map((t) => ({ k: t.k, w: wc(t.c) }));
  const tooShort = lengths.filter((l) => l.w < 120).map((l) => l.k);
  const tooLong = lengths.filter((l) => l.w > 900).map((l) => l.k);

  const sentences = fullProse.split(/[.!?]+\s/).filter(Boolean);
  const avgSentWords = sentences.length ? Math.round(totalWords / sentences.length) : 0;

  let score = 100;
  if (linkCount === 0) score -= 15;
  score -= placeholderLinks * 5;
  if (citationMarkers + linkCount === 0) score -= 10;
  score -= tells.length * 15;
  score -= wallSections.length * 5;
  score -= dupPairs.length * 10;
  score -= tooShort.length * 4;
  score -= tooLong.length * 4;
  if (avgSentWords > 30) score -= 8;
  score = clamp(Math.round(score), 0, 100);

  const flags: string[] = [];
  if (linkCount === 0) flags.push("no hyperlinks");
  if (placeholderLinks) flags.push(`${placeholderLinks} placeholder link(s)`);
  if (citationMarkers + linkCount === 0) flags.push("no citations");
  if (tells.length) flags.push(`filler/AI-tells in ${tells.join(", ")}`);
  if (dupPairs.length) flags.push(`duplication: ${dupPairs.join(", ")}`);
  if (wallSections.length) flags.push(`walls of text: ${wallSections.join(", ")}`);
  if (tooShort.length) flags.push(`thin: ${tooShort.join(", ")}`);
  if (tooLong.length) flags.push(`overlong: ${tooLong.join(", ")}`);
  if (avgSentWords > 30) flags.push(`dense (avg ${avgSentWords} words/sentence)`);

  return {
    score, totalWords, linkCount, placeholderLinks, citationMarkers,
    citationDensity: Number(citationDensity.toFixed(1)), tells, wallSections, dupPairs,
    tooShort, tooLong, avgSentWords, flags,
  };
}

// LLM judge (Gemini via Lovable AI Gateway): substance rubric + concrete fix suggestions.
// deno-lint-ignore no-explicit-any
async function judgeSubstance(report: any, intake: any, t: any): Promise<{ score: number; rubric: Record<string, number>; one_liner: string; insights: string[] } | null> {
  if (!LOVABLE_API_KEY || t.report_status !== "completed") return null;
  const sections = report.report_json?.sections ?? {};
  let prose = "";
  for (const [k, v] of Object.entries(sections) as [string, { visible?: boolean; content?: string }][]) {
    if (v?.visible && (v.content || "").trim()) prose += `\n## ${k}\n${(v.content || "").slice(0, 3000)}`;
  }
  prose = prose.slice(0, 22000);
  const inputs = intake
    ? `Company: ${intake.company_name}; from ${intake.country_of_origin}; industry: ${(intake.industry_sector || []).join(", ")}; target regions: ${(intake.target_regions || []).join(", ")}`
    : "(inputs unavailable)";
  const dropped = (t.utilization?.dropped || []).map((c: string) => RAG_LABELS[c]).join(", ") || "none";
  const presIssues = (t.presentation?.flags || []).join("; ") || "none";

  const sys = "You are a strict QA reviewer for AI-generated market-entry reports. Judge ONLY the report text. The text below is a length-capped excerpt for review — do NOT penalize truncation, overall length, or mid-sentence cutoffs; judge only the quality of what is shown. Respond with ONLY a JSON object, no prose, no markdown fences.";
  const user = `Company inputs: ${inputs}
Data categories surfaced by retrieval but NOT used in the report: ${dropped}
Detected presentation issues: ${presIssues}

REPORT:
${prose}

Score 1-5 each (5=excellent): relevance (to this company's industry/region/goals), specificity (concrete names/numbers vs generic filler), actionability (clear, sequenced next steps), groundedness (claims supported, no hallucination), coherence (structure/flow). Then give an overall 0-100 "score", a "one_liner" verdict (<=20 words), and up to 3 "insights" — each a concrete fix to the PROMPTS / edge-function plumbing / taxonomy (not generic advice), <=22 words.
Return ONLY: {"relevance":n,"specificity":n,"actionability":n,"groundedness":n,"coherence":n,"score":n,"one_liner":"...","insights":["...","..."]}`;

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 30000);
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({ model: AI_MODEL, temperature: 0.2, messages: [{ role: "system", content: sys }, { role: "user", content: user }] }),
      signal: ctrl.signal,
    });
    clearTimeout(to);
    if (!resp.ok) { logErr("substance http", resp.status); return null; }
    const data = await resp.json();
    let content: string = data?.choices?.[0]?.message?.content ?? "";
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const j = JSON.parse(content);
    const rubric = {
      relevance: Number(j.relevance) || 0, specificity: Number(j.specificity) || 0,
      actionability: Number(j.actionability) || 0, groundedness: Number(j.groundedness) || 0, coherence: Number(j.coherence) || 0,
    };
    const rubricAvg = (rubric.relevance + rubric.specificity + rubric.actionability + rubric.groundedness + rubric.coherence) / 25 * 100;
    const score = typeof j.score === "number" ? clamp(Math.round(j.score), 0, 100) : Math.round(rubricAvg);
    const insights = Array.isArray(j.insights) ? j.insights.slice(0, 3).map((x: unknown) => String(x)) : [];
    return { score, rubric, one_liner: String(j.one_liner || ""), insights };
  } catch (e) {
    logErr("substance", String(e));
    return null;
  }
}

// deno-lint-ignore no-explicit-any
export function computeReportTelemetry(report: any, intake: any) {
  const rj = report.report_json ?? {};
  const meta = rj.metadata ?? {};
  const matchesObj = rj.matches ?? {};
  const sectionsObj = rj.sections ?? {};
  const status: string = report.status;

  const matchCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(matchesObj)) matchCounts[k] = Array.isArray(v) ? v.length : 0;
  const tablesHit = RAG_SOURCES.filter((t) => (matchCounts[t] ?? 0) > 0).length;
  const ragHitRate = tablesHit / RAG_SOURCES.length;
  const totalMatches = typeof meta.total_matches === "number" ? meta.total_matches : Object.values(matchCounts).reduce((a, b) => a + b, 0);

  const sectionEntries = Object.entries(sectionsObj) as [string, { visible?: boolean; content?: string }][];
  const sectionsVisible = sectionEntries.filter(([, v]) => v?.visible).length;
  const visibleWithContent = sectionEntries.filter(([, v]) => v?.visible && (v?.content || "").trim().length > 0).length;
  const failedSections = sectionEntries.filter(([, v]) => v?.visible && !((v?.content || "").trim().length > 0)).map(([k]) => k);

  const citations = Array.isArray(meta.perplexity_citations) ? meta.perplexity_citations.length : 0;
  const keyMetrics = Array.isArray(meta.key_metrics) ? meta.key_metrics.length : 0;
  const sources = {
    company_scrape: !!meta.firecrawl_deep_scrape, providers_enriched: meta.firecrawl_providers_enriched ?? 0,
    competitors_found: meta.firecrawl_competitors_found ?? 0, perplexity_used: !!meta.perplexity_used,
    perplexity_health: meta.perplexity_health ?? null,
    citations, key_metrics: keyMetrics, discovered_events: meta.discovered_events_count ?? 0,
    polish_applied: !!meta.polish_applied, bilateral_trade: !!meta.bilateral_trade_available,
    cost_of_business: !!meta.cost_of_business_available, grants: !!meta.grants_available,
    end_buyer_research: !!meta.end_buyer_research_available,
  };
  const researchSignals = [citations > 0, keyMetrics > 0, sources.bilateral_trade, sources.cost_of_business, sources.grants, sources.end_buyer_research, sources.competitors_found > 0, sources.discovered_events > 0];
  const researchDepth = researchSignals.filter(Boolean).length / researchSignals.length;

  const util = computeUtilization(rj);
  const pres = computePresentation(rj);

  let plumbing = 0, coverage = 0, completeness = 0;
  if (status !== "failed") {
    plumbing = Math.round((sources.company_scrape ? 20 : 0) + (sources.perplexity_used ? 15 : 0) + (sectionsVisible ? (visibleWithContent / sectionsVisible) * 40 : 0) + (sources.polish_applied ? 10 : 0) + (failedSections.length === 0 ? 15 : 0));
    coverage = Math.round(ragHitRate * 35 + researchDepth * 35 + (util.rate ?? 0) * 30);
    completeness = Math.round((sectionsVisible ? (visibleWithContent / sectionsVisible) * 60 : 0) + clamp(pres.totalWords / 1500, 0, 1) * 20 + (citations > 0 ? 20 : 0));
  }
  const buildHealth = Math.round(plumbing * 0.3 + coverage * 0.4 + completeness * 0.3);
  // Perplexity totally failing (every call non-200) -> degraded, even though perplexity_used
  // (key present) stays true. perplexity_health is absent on pre-instrumentation reports.
  const ph = sources.perplexity_health;
  const perplexityDead = !!ph && ph.attempted > 0 && ph.succeeded === 0;
  const degraded = status === "completed" && (!sources.company_scrape || tablesHit < 3 || failedSections.length > 0 || !sources.perplexity_used || perplexityDead || researchDepth < 0.25 || (util.rate != null && util.rate < 0.5));

  return {
    report_id: report.id, intake_form_id: report.intake_form_id ?? null, user_id: report.user_id ?? null,
    report_status: status, company: rj.company_name ?? intake?.company_name ?? null,
    build_health: buildHealth, score_plumbing: plumbing, score_coverage: coverage, score_completeness: completeness,
    score_presentation: status === "failed" ? 0 : pres.score,
    degraded, rag_hit_rate: Number(ragHitRate.toFixed(2)), tables_hit: tablesHit, total_matches: totalMatches,
    match_counts: matchCounts, sources, generation_time_ms: meta.generation_time_ms ?? null,
    groundedness: Number(clamp(citations / Math.max(visibleWithContent, 1), 0, 1).toFixed(2)),
    utilization_rate: util.rate != null ? Number(util.rate.toFixed(2)) : null, utilization: util,
    presentation: pres, words: pres.totalWords, sections_visible: sectionsVisible, visible_with_content: visibleWithContent,
    failed_sections: failedSections, user_feedback: report.feedback_score ?? null,
  };
}

// deno-lint-ignore no-explicit-any
function buildReportQualityCard(t: any, intake: any, sub: { score: number; rubric: Record<string, number>; one_liner: string; insights: string[] } | null, reportScore: number): { text: string; blocks: unknown[]; color: string } {
  const band = BAND(t.build_health);
  const company = t.company || "(unknown company)";
  const secs = Math.round((t.generation_time_ms ?? 0) / 1000);

  const inputLine = intake ? [
    intake.country_of_origin ? `from ${intake.country_of_origin}` : null,
    Array.isArray(intake.industry_sector) && intake.industry_sector.length ? `industry: ${intake.industry_sector.join(", ")}` : null,
    Array.isArray(intake.target_regions) && intake.target_regions.length ? `regions: ${intake.target_regions.join(", ")}` : null,
  ].filter(Boolean).join(" · ") : "";

  const s = t.sources;
  // Perplexity health (added by generate-report instrumentation). Absent on older reports,
  // in which case we fall back to the coarse perplexity_used flag.
  const h = s.perplexity_health;
  const ppxOk = h ? h.succeeded > 0 : s.perplexity_used;
  const ppxDetail = h
    ? `${h.succeeded}/${h.attempted} calls OK${h.succeeded === 0 && h.attempted > 0 ? ` · statuses [${(h.statuses || []).join(",")}]` : ""}`
    : (s.perplexity_used ? "ran" : "not used");
  const plumbingLines = [
    `${s.company_scrape ? "✅" : "❌"} Firecrawl — scrape ${s.company_scrape ? "ok" : "FAILED"} · ${s.providers_enriched} providers · ${s.competitors_found} competitors`,
    `${ppxOk ? "✅" : "❌"} Perplexity — ${ppxDetail} · ${s.citations} citations · ${s.key_metrics} key metrics`,
    `${t.failed_sections.length === 0 ? "✅" : "⚠️"} Gemini — ${t.visible_with_content}/${t.sections_visible} sections${t.failed_sections.length ? ` (failed: ${t.failed_sections.join(", ")})` : ""} · polish ${s.polish_applied ? "applied" : "skipped"}`,
  ].join("\n");

  const cov = RAG_SOURCES.map((tbl) => `${(t.match_counts[tbl] ?? 0) > 0 ? "✅" : "⬜"} ${RAG_LABELS[tbl]} ${t.match_counts[tbl] ?? 0}`);
  const covGrid = [cov.slice(0, 4).join("   "), cov.slice(4).join("   ")].join("\n");
  const researchWarn = (h && h.attempted > 0 && h.succeeded === 0)
    ? `\n🚨 Perplexity FAILING — 0/${h.attempted} calls succeeded (statuses [${(h.statuses || []).join(",")}]). Reports are running with NO market research; check the PERPLEXITY_API_KEY / quota.`
    : (s.citations === 0 && s.key_metrics === 0)
      ? "\n⚠️ Perplexity returned 0 citations & 0 key metrics — research enrichment underperforming."
      : "";

  const u = t.utilization;
  const utilPct = u.rate != null ? Math.round(u.rate * 100) : 0;
  const droppedTxt = u.dropped.length ? `\n❌ dropped (surfaced, never used): ${u.dropped.map((c: string) => `${RAG_LABELS[c]} ${u.per[c].surfaced}`).join(", ")}` : "";
  const gatedTxt = u.gated.length ? `\n🔒 gated (hidden at tier): ${u.gated.map((c: string) => `${RAG_LABELS[c]} ${u.per[c].gated}`).join(", ")}` : "";

  const p = t.presentation;
  const presFlags = p.flags.length ? `\n⚠️ ${p.flags.join(" · ")}` : "\n✅ no presentation issues";
  const subLine = sub
    ? `\n*Substance ${sub.score} ${BAND(sub.score).e}*  ·  R${sub.rubric.relevance} S${sub.rubric.specificity} A${sub.rubric.actionability} G${sub.rubric.groundedness} C${sub.rubric.coherence}${sub.one_liner ? ` — _${sub.one_liner}_` : ""}`
    : "";

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `🔬 Report Quality — ${company}`.slice(0, 150) } },
    { type: "section", text: { type: "mrkdwn", text:
      `*Build ${t.build_health} ${band.e}*  ·  Plumbing ${t.score_plumbing} · Coverage ${t.score_coverage} · Completeness ${t.score_completeness}` +
      `\n*Report ${reportScore} ${BAND(reportScore).e}*  ·  Presentation ${p.score} · Utilization ${utilPct}%${subLine ? ` ·${subLine.replace(/\n/, " ")}` : ""}` +
      `\n${t.report_status}${secs ? ` · ${secs}s` : ""}${t.degraded ? "  ·  ⚠️ *DEGRADED*" : ""}` } },
  ];
  if (inputLine) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `*Inputs:* ${inputLine}` }] });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Plumbing (how it was built)*\n${plumbingLines}` } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*RAG coverage (surfaced)*\n${covGrid}\n→ *${t.tables_hit}/${RAG_SOURCES.length}* data types · ${t.total_matches} matches${researchWarn}` } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Used in report* — ${u.usedTotal}/${u.surfacedTotal} surfaced items included (*${utilPct}%*)${droppedTxt}${gatedTxt}` } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Presentation ${p.score}/100* — ${t.visible_with_content} sections · ~${p.totalWords.toLocaleString()} words · ${p.linkCount} links · ${p.citationMarkers} citations${presFlags}` } });
  if (sub && sub.insights.length) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Suggested fixes (plumbing/prompts/taxonomy)*\n${sub.insights.map((i) => `• ${i}`).join("\n")}` } });
  }
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `<${REPORT_BASE_URL}/${t.report_id}|View report ↗>  ·  report ${String(t.report_id).slice(0, 8)}…${t.user_feedback != null ? `  ·  user rating ${t.user_feedback}` : ""}` }] });

  return { text: `Report Quality — ${company} — Build ${t.build_health}/100`, blocks, color: band.c };
}

// deno-lint-ignore no-explicit-any
export async function handleReportQuality(supabase: any, ev: any): Promise<{ text: string; blocks: unknown[]; color: string } | null> {
  const reportId = ev.object_id;
  if (!reportId) return null;
  const { data: report, error } = await supabase
    .from("user_reports").select("id,user_id,intake_form_id,status,report_json,feedback_score").eq("id", reportId).maybeSingle();
  if (error) { logErr("load report", error.message); return null; }
  if (!report) { logErr("load report", "not found"); return null; }

  let intake = null;
  if (report.intake_form_id) {
    const { data: i } = await supabase.from("user_intake_forms")
      .select("company_name,country_of_origin,industry_sector,target_regions,services_needed").eq("id", report.intake_form_id).maybeSingle();
    intake = i;
  }

  const t = computeReportTelemetry(report, intake);

  // Substance (LLM) — compute once per report; reuse if already judged (idempotent cost on re-drive).
  let sub: { score: number; rubric: Record<string, number>; one_liner: string; insights: string[] } | null = null;
  const { data: existing } = await supabase.from("report_quality").select("score_substance,substance,insights").eq("report_id", t.report_id).maybeSingle();
  if (existing && existing.score_substance != null) {
    sub = { score: existing.score_substance, rubric: existing.substance ?? {}, one_liner: (existing.substance?.one_liner) ?? "", insights: existing.insights ?? [] };
  } else {
    sub = await judgeSubstance(report, intake, t);
  }
  const reportScore = t.report_status === "failed" ? 0 : (sub ? Math.round(0.4 * t.score_presentation + 0.6 * sub.score) : t.score_presentation);

  const { error: upErr } = await supabase.from("report_quality").upsert({
    report_id: t.report_id, intake_form_id: t.intake_form_id, user_id: t.user_id, report_status: t.report_status,
    build_health: t.build_health, score_plumbing: t.score_plumbing, score_coverage: t.score_coverage,
    score_completeness: t.score_completeness, score_presentation: t.score_presentation,
    score_substance: sub ? sub.score : null, substance: sub ? { ...sub.rubric, one_liner: sub.one_liner } : null,
    insights: sub ? sub.insights : null, report_score: reportScore,
    degraded: t.degraded, rag_hit_rate: t.rag_hit_rate, tables_hit: t.tables_hit, total_matches: t.total_matches,
    match_counts: t.match_counts, sources: t.sources, generation_time_ms: t.generation_time_ms, groundedness: t.groundedness,
    utilization_rate: t.utilization_rate, utilization: t.utilization, presentation: t.presentation, user_feedback: t.user_feedback,
    metadata: { company: t.company, words: t.words, sections_visible: t.sections_visible, visible_with_content: t.visible_with_content, failed_sections: t.failed_sections },
  }, { onConflict: "report_id" });
  if (upErr) logErr("upsert", upErr.message);

  return buildReportQualityCard(t, intake, sub, reportScore);
}
