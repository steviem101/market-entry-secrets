// MES-159 — existing-Australia-presence signal (pure logic, node --test).
//
// The pipeline frames every report as market ENTRY, so an established incumbent
// (Daon: an Irish multinational already operating in AU) got a greenfield
// "how to enter" report — investors, accelerators, grants, co-working. This
// module derives a structured `{ status, evidence[], sources[] }` presence signal
// from the company scrape + one search + a deterministic directory cross-reference,
// and turns it into section-prompt directives that de-emphasise entry logistics
// and emphasise expansion when the company is already here.
//
// Reuses the competitor `au_presence` extraction shape already in generate-report.
// Anti-hallucination: `established` REQUIRES concrete evidence (an AU address, a
// .com.au domain, a named AU customer, or a directory hit); weak/failed evidence
// falls back to `none` — the model must never guess a presence into existence.
// Pure module — no Deno globals, no I/O — the impure scrape/search/LLM calls live
// in index.ts; this owns the prompt, the parse, the directory match, and the merge.

export type AuPresenceStatus = "none" | "entering" | "established";

export interface AuPresenceSignal {
  status: AuPresenceStatus;
  /** Short quotes/paraphrases of what was actually found (never invented). */
  evidence: string[];
  /** URLs the evidence traces to (site pages, search results, directory rows). */
  sources: string[];
}

/** The safe default — asserted whenever evidence is weak, missing, or unparseable.
 *  Defaulting to `none` keeps today's entry framing for a genuine entrant. */
export const NONE_SIGNAL: AuPresenceSignal = { status: "none", evidence: [], sources: [] };

// ── Prompt (structured output) ──────────────────────────────────────────

/** Build the classification prompt. The model's ONLY job is scrape/search →
 *  structured signal; it must quote evidence and answer `none` honestly. */
export function buildAuPresencePrompt(
  companyName: string,
  website: string,
  scrapeText: string,
  searchText: string,
): string {
  const scrape = (scrapeText || "").slice(0, 6000);
  const search = (searchText || "").slice(0, 3000);
  return `You are assessing whether a company ALREADY operates in Australia, to decide whether its market report should focus on ENTERING Australia or EXPANDING an existing Australian presence.

Company: ${companyName}
Website: ${website}

--- COMPANY SITE CONTENT ---
${scrape || "(no site content available)"}

--- WEB SEARCH RESULTS ("${companyName}" Australia office / customers) ---
${search || "(no search results available)"}

Classify the company's Australian footprint as exactly one of:
- "established": CONCRETE evidence of an operating AU presence — an Australian office/address, a .com.au domain, a named Australian customer/case study, an Australia locations/contact page, or AU job listings.
- "entering": signals of active expansion into AU but not yet operating (e.g. "coming to Australia", an AU partnership announcement, hiring a first AU role) WITHOUT the concrete markers above.
- "none": no evidence of any Australian presence or plans.

RULES:
- Require CONCRETE evidence for "established". If the evidence is weak or ambiguous, choose "entering" or "none" — never guess "established".
- Every evidence string must be a short quote or close paraphrase of something ACTUALLY present in the content above. Do NOT invent offices, customers, domains, or figures.
- "none" is a valid, expected answer. If you found nothing, say so.

Return ONLY a JSON object:
{"status": "none|entering|established", "evidence": ["short quote of what was found", ...], "sources": ["url the evidence came from", ...]}`;
}

// ── Parse (schema-validate, deterministic none fallback) ─────────────────

const STATUSES: ReadonlySet<string> = new Set(["none", "entering", "established"]);

function stripFence(raw: string): string {
  let s = (raw || "").trim();
  // Case-insensitive ```json / ``` fences (matches the other parsers in this dir).
  s = s.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/i, "").trim();
  return s;
}

/** Parse the model reply into a validated signal. Any parse/shape failure →
 *  NONE_SIGNAL (fail-closed: we never fabricate an "established" from garbage). */
export function parseAuPresenceResponse(raw: string | null | undefined): AuPresenceSignal {
  if (!raw) return { ...NONE_SIGNAL };
  let obj: unknown;
  try {
    const s = stripFence(raw);
    // Tolerate prose-wrapped JSON: grab the first {...} block.
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end <= start) return { ...NONE_SIGNAL };
    obj = JSON.parse(s.slice(start, end + 1));
  } catch {
    return { ...NONE_SIGNAL };
  }
  if (!obj || typeof obj !== "object") return { ...NONE_SIGNAL };
  const o = obj as Record<string, unknown>;
  const status = typeof o.status === "string" && STATUSES.has(o.status)
    ? (o.status as AuPresenceStatus)
    : "none";
  const evidence = cleanStrings(o.evidence);
  const sources = cleanStrings(o.sources);
  // Fail-closed invariant: "established"/"entering" MUST carry evidence, or it's
  // an unsupported assertion — downgrade to none. (Directory hits are folded in
  // separately by mergePresence, which supplies its own evidence.)
  if ((status === "established" || status === "entering") && evidence.length === 0) {
    return { ...NONE_SIGNAL };
  }
  return { status, evidence, sources };
}

function cleanStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x === "string") {
      const t = x.trim();
      if (t) out.push(t.slice(0, 300));
    }
    if (out.length >= 8) break;
  }
  return [...new Set(out)];
}

// ── Directory cross-reference (deterministic) ────────────────────────────

export interface DirectoryRow {
  name?: string | null;
  website?: string | null;
  website_url?: string | null;
  domain?: string | null;
  sector_tags?: string[] | null;
}

/** Normalise a URL/domain to a bare host for comparison (drops scheme, www, path). */
export function hostOf(url: string | null | undefined): string {
  const s = (url || "").trim().toLowerCase();
  if (!s) return "";
  return s
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .trim()
    // Restrict to the legal hostname charset. A real domain is only [a-z0-9.-];
    // this also makes the value safe to interpolate into a PostgREST `.or()`
    // filter (a stray comma would otherwise inject an extra OR-condition). Callers
    // compare hostOf(a) === hostOf(b), so stripping both sides stays consistent.
    .replace(/[^a-z0-9.-]/g, "");
}

/** Deterministic evidence that the SUBJECT company already appears in our AU
 *  directories. Domain match first (strong); then exact name match (weaker, but
 *  our directories are AU-scoped so a name hit still implies AU presence). Returns
 *  one evidence string + source per matched table. */
export function directoryPresenceEvidence(
  companyName: string,
  companyDomain: string,
  tables: Array<{ label: string; rows: DirectoryRow[] }>,
): { evidence: string[]; sources: string[] } {
  const evidence: string[] = [];
  const sources: string[] = [];
  const host = hostOf(companyDomain);
  const name = (companyName || "").trim().toLowerCase();
  for (const { label, rows } of tables) {
    for (const row of rows || []) {
      const rowHost = hostOf(row.website || row.website_url || row.domain);
      const domainHit = !!host && !!rowHost && rowHost === host;
      const nameHit = !!name && (row.name || "").trim().toLowerCase() === name;
      if (domainHit || nameHit) {
        const how = domainHit ? "domain match" : "name match";
        evidence.push(`Listed in the Market Entry Secrets ${label} directory (${how})`);
        const src = (row.website || row.website_url || row.domain || "").trim();
        if (src) sources.push(src);
        break; // one hit per table is enough
      }
    }
  }
  return { evidence, sources };
}

// ── Merge ────────────────────────────────────────────────────────────────

/** Combine the LLM signal with deterministic directory evidence. A directory hit
 *  is concrete AU evidence, so it can LIFT the status to established; it never
 *  downgrades. Evidence/sources are merged and de-duped. */
export function mergePresence(
  llm: AuPresenceSignal,
  directory: { evidence: string[]; sources: string[] },
): AuPresenceSignal {
  const evidence = [...new Set([...(llm.evidence || []), ...(directory.evidence || [])])].slice(0, 10);
  const sources = [...new Set([...(llm.sources || []), ...(directory.sources || [])])].slice(0, 10);
  // A directory hit is strong, concrete evidence of an operating AU presence.
  const status: AuPresenceStatus = directory.evidence.length > 0 ? "established" : llm.status;
  return { status, evidence, sources };
}

// ── Section-prompt directives ────────────────────────────────────────────

/** The reweight directive threaded into EVERY section's system prompt. Empty for
 *  `none` (today's output is unchanged). De-emphasises — never hard-removes —
 *  entry logistics, and always defers to explicitly selected goals. */
export function buildPresenceReweightNote(status: AuPresenceStatus): string {
  if (status === "established") {
    return `\n\nEXISTING AUSTRALIAN PRESENCE: This company ALREADY operates in Australia — the report is about DEEPENING that presence, not entering the market. De-emphasise greenfield market-entry logistics (entity/company setup, visa/immigration, startup grants and R&D incentives, accelerators/incubators, co-working spaces) unless the user explicitly selected a goal that needs them. Emphasise instead: local partnerships and channel development, community/industry engagement, enterprise sales motion, local hiring and talent, and deepening existing customer accounts. Do not claim an Australian footprint beyond the evidence provided.`;
  }
  if (status === "entering") {
    return `\n\nAUSTRALIAN PRESENCE (IN PROGRESS): This company is actively moving into Australia but is not yet fully established. Blend market-entry guidance with early expansion/partnership and go-to-market advice. Do not overstate the existing footprint beyond the evidence provided.`;
  }
  return "";
}

/** Exec-summary-only directive: add a short, evidence-grounded footprint line when
 *  established. Empty otherwise. */
export function buildFootprintNote(signal: AuPresenceSignal): string {
  if (signal.status !== "established" || signal.evidence.length === 0) return "";
  const bullets = signal.evidence.slice(0, 4).map((e) => `  - ${e}`).join("\n");
  return `\n\nCURRENT AUSTRALIAN FOOTPRINT: Open the executive summary with one short sentence acknowledging the company's existing Australian presence, grounded ONLY in this evidence (do not add offices, customers, or figures beyond it):\n${bullets}`;
}

/** Compact, tier-safe telemetry for report_json.metadata (counts + sources, no
 *  free-text evidence beyond what the reader already sees). */
export function presenceMetadata(signal: AuPresenceSignal): {
  status: AuPresenceStatus;
  evidence_count: number;
  sources: string[];
} {
  return { status: signal.status, evidence_count: signal.evidence.length, sources: signal.sources.slice(0, 5) };
}
