// MES-148 Phase 1a — claims registry (pure logic, no I/O, runs under node --test).
//
// Research/extraction output is converted into structured claims:
//   { claim_id, statement, value, unit, source_url, confidence, as_of, stage }
// Claims are persisted to public.report_claims (service-role write) and are the
// evidence base the verifier (verifier.ts) checks drafts against. Deterministic
// sources (key metrics, directory rows) become claims in code; the free-prose
// research streams go through ONE model extraction call whose JSON reply is
// validated here (validateClaims) with a single retry on parse failure.

export interface ReportClaim {
  claim_id: string;
  statement: string;
  value: string | null;
  unit: string | null;
  source_url: string | null;
  confidence: "high" | "medium" | "low";
  as_of: string | null;
  stage: "research" | "metrics" | "directory" | "extraction";
}

export interface KeyMetricInput {
  label: string;
  value: string;
  context: string;
  estimated?: boolean;
}

const MAX_EXTRACTED_CLAIMS = 40;
const MAX_FIELD_CHARS = 500;

const clip = (s: unknown, max = MAX_FIELD_CHARS): string =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** Resolve a "[N]" citation marker inside metric text to its source URL. */
function citationUrlFor(text: string, citations: string[]): string | null {
  const m = /\[(\d{1,3})\]/.exec(text || "");
  if (!m) return null;
  const idx = Number(m[1]) - 1;
  return idx >= 0 && idx < citations.length ? citations[idx] : null;
}

/** Deterministic claims from the extracted KEY METRICS block (the canonical
 *  figures broadcast to every section — MES-35 R11 makes these the highest-value
 *  rows in the registry). */
export function claimsFromKeyMetrics(
  metrics: KeyMetricInput[],
  citations: string[],
  startIndex = 1,
): ReportClaim[] {
  const out: ReportClaim[] = [];
  for (const m of metrics || []) {
    if (!m || !clip(m.value)) continue;
    const sourceUrl = citationUrlFor(`${m.value} ${m.context}`, citations || []);
    out.push({
      claim_id: `c${startIndex + out.length}`,
      statement: clip([m.label, m.context].filter(Boolean).join(" — ")),
      value: clip(m.value, 120) || null,
      unit: null,
      source_url: sourceUrl,
      // A cited, non-estimated metric is high confidence; model-flagged
      // estimates are low; the rest medium.
      confidence: m.estimated ? "low" : sourceUrl ? "high" : "medium",
      as_of: null,
      stage: "metrics",
    });
  }
  return out;
}

/** Prompt for the single model extraction call over the research prose.
 *  The reply must be a JSON array matching CLAIM_EXTRACTION_SCHEMA. */
export function buildClaimsExtractionPrompt(
  streams: Array<{ name: string; text: string }>,
): string {
  const body = streams
    .filter((s) => (s.text || "").trim())
    .map((s) => `--- SOURCE STREAM: ${s.name} ---\n${clip(s.text, 6000)}`)
    .join("\n\n");
  return `Extract the discrete, checkable factual claims from the market research below.

Return ONLY a JSON array (no markdown fences, no commentary). Each element:
{
  "statement": "one self-contained factual sentence, in the source's own terms",
  "value": "the key figure exactly as written (e.g. \\"$8.48B\\", \\"5.1%\\", \\"2,400+\\") or null when the claim is qualitative",
  "unit": "unit/currency qualifier when obvious (e.g. \\"AUD\\", \\"% CAGR\\") or null",
  "confidence": "high" | "medium" | "low",
  "as_of": "the year/date the claim refers to (e.g. \\"2024\\") or null"
}

Rules:
- Extract ONLY claims stated in the text — never add outside knowledge, never estimate.
- Prefer quantitative claims (market sizes, growth rates, costs, salaries, tax/levy rates, grant amounts, deal counts) and named regulatory obligations.
- One claim per element; at most ${MAX_EXTRACTED_CLAIMS} elements; skip duplicates.
- confidence: "high" when the text states it plainly with a figure, "medium" when hedged ("estimated", "around"), "low" when speculative.
- If there are no extractable claims, return [].

${body}`;
}

/** JSON-schema (draft-07 style) describing one extracted claim — used for
 *  documentation/tests and mirrored by validateClaims below (the edge runtime
 *  has no ajv; validation is the hand-rolled mirror). */
export const CLAIM_EXTRACTION_SCHEMA = {
  type: "array",
  maxItems: MAX_EXTRACTED_CLAIMS,
  items: {
    type: "object",
    required: ["statement", "confidence"],
    properties: {
      statement: { type: "string", minLength: 8 },
      value: { type: ["string", "null"] },
      unit: { type: ["string", "null"] },
      confidence: { enum: ["high", "medium", "low"] },
      as_of: { type: ["string", "null"] },
    },
  },
} as const;

/** Parse + validate the model's extraction reply against the schema above.
 *  Returns null on ANY violation so the caller can retry once, then skip. */
export function parseClaimsResponse(
  raw: string,
  startIndex: number,
): ReportClaim[] | null {
  let parsed: unknown;
  try {
    const cleaned = (raw || "").replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const out: ReportClaim[] = [];
  for (const item of parsed.slice(0, MAX_EXTRACTED_CLAIMS)) {
    if (typeof item !== "object" || item === null) return null;
    const o = item as Record<string, unknown>;
    const statement = clip(o.statement);
    if (statement.length < 8) return null;
    const confidence = o.confidence;
    if (confidence !== "high" && confidence !== "medium" && confidence !== "low") return null;
    const strOrNull = (v: unknown, max = 120): string | null => {
      if (v === null || v === undefined) return null;
      if (typeof v !== "string") return null;
      const c = clip(v, max);
      return c || null;
    };
    // value/unit/as_of must be string-or-null when present; a wrong type fails
    // validation (schema violation), triggering the caller's retry.
    if (o.value !== undefined && o.value !== null && typeof o.value !== "string") return null;
    if (o.unit !== undefined && o.unit !== null && typeof o.unit !== "string") return null;
    if (o.as_of !== undefined && o.as_of !== null && typeof o.as_of !== "string") return null;
    out.push({
      claim_id: `c${startIndex + out.length}`,
      statement,
      value: strOrNull(o.value),
      unit: strOrNull(o.unit, 40),
      source_url: null,
      confidence,
      as_of: strOrNull(o.as_of, 40),
      stage: "research",
    });
  }
  return out;
}

/** Drop near-duplicate claims (same normalised statement, or same value+first
 *  few statement tokens). Keeps first occurrence — metrics claims are passed
 *  first, so the canonical figures win over re-extracted copies. */
export function dedupeClaims(claims: ReportClaim[]): ReportClaim[] {
  const seen = new Set<string>();
  const out: ReportClaim[] = [];
  for (const c of claims) {
    const norm = c.statement.toLowerCase().replace(/[^a-z0-9%$.]+/g, " ").trim();
    const keyA = norm.split(" ").slice(0, 12).join(" ");
    const keyB = c.value ? `${c.value.toLowerCase()}|${norm.split(" ").slice(0, 4).join(" ")}` : "";
    if (seen.has(keyA) || (keyB && seen.has(keyB))) continue;
    seen.add(keyA);
    if (keyB) seen.add(keyB);
    out.push(c);
  }
  return out;
}

/** Renumber claim_ids to a contiguous c1..cN after merge/dedupe so the stored
 *  registry has no gaps (writers/renderer reference these ids). */
export function renumberClaims(claims: ReportClaim[]): ReportClaim[] {
  return claims.map((c, i) => ({ ...c, claim_id: `c${i + 1}` }));
}

/** Numbered evidence block for section prompts (flag-gated wiring — writers may
 *  only assert facts carrying a claim id once this ships beyond shadow). */
export function claimsEvidenceBlock(claims: ReportClaim[]): string {
  if (!claims.length) return "";
  const lines = claims.map((c) =>
    `${c.claim_id}. ${c.statement}${c.value ? ` [value: ${c.value}]` : ""}${c.as_of ? ` (as of ${c.as_of})` : ""}`
  );
  return lines.join("\n");
}
