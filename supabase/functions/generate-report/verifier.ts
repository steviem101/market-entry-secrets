// MES-148 Phase 1a — blocking verifier (pure logic, no I/O, node --test).
//
// Checks every draft section against the evidence the pipeline actually
// provided: the claims registry (claims.ts), the raw research corpus, and the
// matched directory rows. Two deterministic checks:
//   * numerals — every money/percent/magnitude figure in a draft must appear in
//     the claims or somewhere in the research corpus (normalised comparison with
//     a small rounding tolerance). A number that appears NOWHERE in the inputs
//     was invented by the writer model.
//   * entities — every multi-word proper-noun phrase must resolve to a directory
//     row, a scraped competitor/buyer, the intake, or the research corpus.
// Ships in SHADOW mode (log + metadata only). CLAIMS_VERIFIER_MODE=blocking
// upgrades it to regenerate-once-then-flag (index.ts owns that loop). An
// optional single strong-model adjudication call separates true fabrications
// from benign derivations before anything blocks — prompt builders live here,
// the call lives in index.ts.

import type { ReportClaim } from "./claims.ts";

export interface NumeralMention {
  raw: string;
  normalized: number | null;
  context: string;
}

export interface SectionVerification {
  section: string;
  numerals_checked: number;
  entities_checked: number;
  unverified_numerals: NumeralMention[];
  unverified_entities: string[];
}

export interface VerificationResult {
  sections: SectionVerification[];
  totals: {
    numerals_checked: number;
    entities_checked: number;
    unverified_numerals: number;
    unverified_entities: number;
  };
}

// ── Numeral extraction ────────────────────────────────────────────────────

const MAGNITUDES: Record<string, number> = {
  k: 1e3,
  m: 1e6,
  mn: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9,
  t: 1e12,
  trillion: 1e12,
};

/** Normalise "US$8.48 billion" / "8.48B" / "2,400+" / "5.1%" to a number.
 *  Currency symbols and thousands separators are stripped; magnitude suffixes
 *  multiply. Returns null when no digits parse. */
export function normalizeNumeral(raw: string): number | null {
  const m = /(\d[\d,]*(?:\.\d+)?)\s*(k|mn|m|bn|b|t|million|billion|trillion)?\b/i.exec(raw || "");
  if (!m) return null;
  const base = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(base)) return null;
  const mult = m[2] ? MAGNITUDES[m[2].toLowerCase()] ?? 1 : 1;
  return base * mult;
}

// Strip things that legitimately contain digits but are not factual figures:
// [N] citation markers, markdown link targets (URLs), and code spans.
function stripNonFactualDigits(text: string): string {
  return (text || "")
    // Drop markdown link TARGETS first: a linked citation like
    // `[2](https://x/report-12500)` must lose its URL before the [N] strip,
    // otherwise removing `[2]` breaks the `](` match and the URL's digits (12500)
    // survive into numeral extraction as a phantom figure.
    .replace(/\]\([^)]*\)/g, "]") // keep link text, drop the URL
    .replace(/\[(\d{1,3})\]/g, " ") // [N] citation markers
    .replace(/`[^`]*`/g, " ");      // code spans
}

const NUMERAL_PATTERNS: RegExp[] = [
  // currency, optionally magnitude-suffixed: $8.48B, US$3,000, A$2.5 million, €400k
  /(?:AUD|USD|EUR|GBP|NZD|A?\$|US\$|AU\$|NZ\$|€|£)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:k|m|bn|b|million|billion|trillion))?\b\+?/gi,
  // percentages: 5.1%, 43.5 per cent
  /\b\d[\d,]*(?:\.\d+)?\s?(?:%|per cent|percent)/gi,
  // bare magnitude figures: 8.48 billion, 2.4m
  /\b\d[\d,]*(?:\.\d+)?\s?(?:million|billion|trillion)\b\+?/gi,
  // comma-grouped counts (2,400+) and long plain integers (12500) — 4-digit
  // plain integers are deliberately excluded (years dominate that shape).
  /\b\d{1,3}(?:,\d{3})+\+?|\b\d{5,}\b\+?/g,
];

/** Extract the checkable figures from a markdown draft, with ~40 chars of
 *  surrounding context for telemetry/adjudication. */
export function extractNumerals(text: string): NumeralMention[] {
  const cleaned = stripNonFactualDigits(text);
  // Collect every match with its ACTUAL span (m.index), then suppress spans that
  // start inside an already-kept longer span. Overlap is tested against the real
  // match position — not indexOf(raw), which finds the first occurrence and so
  // (a) mis-tests a figure that repeats and (b) rescans the whole string O(n²).
  const spans: Array<{ start: number; end: number; raw: string }> = [];
  for (const pattern of NUMERAL_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(cleaned)) !== null) {
      const raw = m[0].trim();
      // The trimmed raw can be shorter than m[0] (leading/trailing space); anchor
      // the span at the raw's offset within the match so the bounds stay tight.
      const lead = m[0].indexOf(raw);
      const start = m.index + (lead < 0 ? 0 : lead);
      spans.push({ start, end: start + raw.length, raw });
    }
  }
  // Sort by start, then by longest span first, so the enclosing currency match
  // is kept and the inner bare-magnitude match is suppressed.
  spans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const out: NumeralMention[] = [];
  const kept: Array<{ start: number; end: number }> = [];
  for (const s of spans) {
    if (kept.some((k) => s.start >= k.start && s.start < k.end)) continue;
    kept.push({ start: s.start, end: s.end });
    out.push({
      raw: s.raw,
      normalized: normalizeNumeral(s.raw),
      context: cleaned.slice(Math.max(0, s.start - 40), s.end + 40).replace(/\s+/g, " ").trim(),
    });
  }
  return out;
}

// ── Allowed-evidence corpus ───────────────────────────────────────────────

export interface EvidenceCorpus {
  /** Sorted, de-duplicated normalised numbers found anywhere in the evidence.
   *  Sorted so numeralIsSupported can binary-search the ±tolerance band instead
   *  of scanning the whole array per checked figure. */
  numbers: number[];
  /** Lowercased haystack of all evidence text (entity substring checks). */
  haystack: string;
  /** Lowercased known entity names (directory rows, competitors, intake…). */
  entityNames: Set<string>;
}

/** Build the corpus of everything the pipeline actually gave the writers.
 *  `texts` = research streams, scraped profiles, prompts' JSON variables etc.
 *  `entityNames` = names from directory matches / competitors / buyers / intake. */
export function buildEvidenceCorpus(
  texts: string[],
  entityNames: string[],
  claims: ReportClaim[],
): EvidenceCorpus {
  const joined = texts.filter(Boolean).join("\n");
  const claimText = claims.map((c) => `${c.statement} ${c.value ?? ""}`).join("\n");
  const all = `${joined}\n${claimText}`;
  // ONE pass: every digit-run, plus (when a magnitude suffix follows) the
  // magnitude-multiplied value — so "8.48 billion" contributes both 8.48 and
  // 8.48e9. A Set dedups the (id/score/timestamp-heavy) corpus, and we sort once
  // so numeralIsSupported can binary-search. The old code ran the full
  // extractNumerals machinery (with its own quadratic overlap check) over this
  // hundreds-of-KB string AND then a second plain-digit pass — both are folded here.
  const set = new Set<number>();
  const DIGIT_MAG = /(\d[\d,]*(?:\.\d+)?)\s?(k|mn|m|bn|b|t|million|billion|trillion)?/gi;
  let m: RegExpExecArray | null;
  while ((m = DIGIT_MAG.exec(all)) !== null) {
    const base = Number(m[1].replace(/,/g, ""));
    if (!Number.isFinite(base)) continue;
    set.add(base);
    if (m[2]) {
      const scaled = normalizeNumeral(m[0]);
      if (scaled !== null) set.add(scaled);
    }
  }
  return {
    numbers: [...set].sort((a, b) => a - b),
    haystack: all.toLowerCase(),
    entityNames: new Set(entityNames.filter(Boolean).map((n) => n.toLowerCase().trim())),
  };
}

/** Rounding tolerance: "US$8.5B" in prose vs "$8.48B" in evidence is not a
 *  fabrication. 1% relative tolerance covers prose rounding without letting
 *  genuinely different figures through. */
const REL_TOLERANCE = 0.01;

export function numeralIsSupported(mention: NumeralMention, corpus: EvidenceCorpus): boolean {
  if (mention.normalized === null) return true; // unparseable → not checkable
  const target = mention.normalized;
  const nums = corpus.numbers; // sorted ascending
  if (nums.length === 0) return false;
  // Binary-search the insertion point, then check only the neighbours within the
  // relative-tolerance band (evidence numbers are sorted + de-duplicated).
  let lo = 0, hi = nums.length - 1, pos = nums.length;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] >= target) { pos = mid; hi = mid - 1; } else { lo = mid + 1; }
  }
  const within = (n: number) => {
    const scale = Math.max(Math.abs(n), Math.abs(target));
    return n === target || (scale > 0 && Math.abs(n - target) / scale <= REL_TOLERANCE);
  };
  for (let i = pos; i < nums.length; i++) {
    if (within(nums[i])) return true;
    const scale = Math.max(Math.abs(nums[i]), Math.abs(target));
    if (scale > 0 && (nums[i] - target) / scale > REL_TOLERANCE) break;
  }
  for (let i = pos - 1; i >= 0; i--) {
    if (within(nums[i])) return true;
    const scale = Math.max(Math.abs(nums[i]), Math.abs(target));
    if (scale > 0 && (target - nums[i]) / scale > REL_TOLERANCE) break;
  }
  return false;
}

// ── Entity extraction ─────────────────────────────────────────────────────

// Connectors allowed INSIDE a proper-noun phrase ("Department of Home Affairs").
const CONNECTORS = new Set(["of", "and", "for", "the", "&", "de", "du"]);

// Leading tokens that start ordinary sentences/headings, not entities.
const LEAD_STOPWORDS = new Set([
  "the", "this", "these", "those", "their", "there", "a", "an", "in", "for",
  "when", "while", "however", "although", "engage", "consider", "leverage",
  "australian", "australia", "new", "key", "your", "our", "with", "by", "on",
  "to", "from", "as", "at", "it", "they", "we", "if", "each", "every", "both",
  "prioritise", "prioritize", "contact", "review", "attend", "secure", "focus",
  "explore", "visit", "discover", "establish", "ensure", "target", "expand",
]);

// Generic report phrases that are proper-noun-shaped but never fabricated
// entities — checked as whole phrases after lowercasing.
const BUILTIN_ALLOW = new Set([
  "executive summary", "action plan", "key metrics", "swot analysis",
  "market entry", "market entry secrets", "australian english",
  "australia", "new zealand", "new south wales", "western australia",
  "south australia", "northern territory", "australian capital territory",
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
  "hobart", "darwin", "queensland", "victoria", "tasmania", "anz",
  "gst", "r&d", "asic", "ato", "abn", "acn", "austrade", "emdg",
  "phase one", "phase two", "phase three", "quarter one", "next steps",
  "january", "february", "march", "april", "may", "june", "july",
  "august", "september", "october", "november", "december",
]);

/** Extract candidate proper-noun phrases (>=2 capitalised tokens, connectors
 *  allowed inside). Single capitalised words are deliberately ignored — too
 *  noisy at sentence starts; multi-word org/person names are where fabrication
 *  risk lives (grounding rule #1). */
export function extractCandidateEntities(text: string): string[] {
  const cleaned = stripNonFactualDigits(text)
    .replace(/^#+\s.*$/gm, " ")     // headings are layout, not claims
    .replace(/\*\*/g, "")            // unwrap bold
    .replace(/\[([^\]]+)\]/g, "$1"); // unwrap remaining link text
  // "." is deliberately NOT in the token class — a sentence-final period would
  // otherwise let a run bridge two sentences ("KPMG Australia. This Section").
  const tokenRun =
    /[A-Z][A-Za-z0-9&'’-]*(?:[ \t]+(?:[A-Z][A-Za-z0-9&'’-]*|of|and|for|the|&|de|du)){1,6}/g;
  const out = new Set<string>();
  const allowed = (toks: string[]) =>
    BUILTIN_ALLOW.has(toks.join(" ").replace(/[.,;:]+$/, "").toLowerCase());
  let m: RegExpExecArray | null;
  while ((m = tokenRun.exec(cleaned)) !== null) {
    let tokens = m[0].split(/\s+/);
    // Trim trailing connectors ("Department of" → drop the dangling "of").
    while (tokens.length && CONNECTORS.has(tokens[tokens.length - 1].toLowerCase())) tokens.pop();
    if (tokens.length < 2) continue;
    // Check the allowlist on the FULL phrase BEFORE stripping a lead stopword —
    // otherwise an allowlisted name that legitimately starts with a stopword
    // ("New South Wales" → "new" is a lead-stopword) gets mangled to "South
    // Wales" and flagged. (Probe: this was a live false positive.)
    if (allowed(tokens)) continue;
    // Drop a sentence-start ordinary word leading the phrase, then re-check the
    // allowlist ("Explore New Zealand" → "New Zealand", which is allowlisted).
    if (LEAD_STOPWORDS.has(tokens[0].toLowerCase())) {
      tokens = tokens.slice(1);
      if (tokens.length < 2 || allowed(tokens)) continue;
    }
    // Require at least two genuinely capitalised tokens after trimming.
    const caps = tokens.filter((t) => /^[A-Z]/.test(t));
    if (caps.length < 2) continue;
    out.add(tokens.join(" ").replace(/[.,;:]+$/, ""));
  }
  return [...out];
}

export function entityIsSupported(entity: string, corpus: EvidenceCorpus): boolean {
  const lower = entity.toLowerCase().trim();
  if (BUILTIN_ALLOW.has(lower)) return true;
  if (corpus.entityNames.has(lower)) return true;
  if (corpus.haystack.includes(lower)) return true;
  // A known entity referenced with a trailing/leading extra word still counts
  // ("Enterprise Ireland team" / "the Austrade office"): any known name that
  // contains, or is contained by, the candidate passes.
  for (const name of corpus.entityNames) {
    if (name.length >= 6 && (lower.includes(name) || name.includes(lower))) return true;
  }
  return false;
}

// ── Section-level verification ────────────────────────────────────────────

export function verifySections(
  sections: Record<string, { content?: string } | undefined>,
  sectionOrder: string[],
  corpus: EvidenceCorpus,
): VerificationResult {
  const results: SectionVerification[] = [];
  for (const name of sectionOrder) {
    const content = sections[name]?.content || "";
    if (!content.trim()) continue;
    const numerals = extractNumerals(content);
    const entities = extractCandidateEntities(content);
    results.push({
      section: name,
      numerals_checked: numerals.length,
      entities_checked: entities.length,
      unverified_numerals: numerals.filter((n) => !numeralIsSupported(n, corpus)),
      unverified_entities: entities.filter((e) => !entityIsSupported(e, corpus)),
    });
  }
  return {
    sections: results,
    totals: {
      numerals_checked: results.reduce((s, r) => s + r.numerals_checked, 0),
      entities_checked: results.reduce((s, r) => s + r.entities_checked, 0),
      unverified_numerals: results.reduce((s, r) => s + r.unverified_numerals.length, 0),
      unverified_entities: results.reduce((s, r) => s + r.unverified_entities.length, 0),
    },
  };
}

// ── Strong-model adjudication (prompt + parser; the call lives in index.ts) ──

export interface FlaggedItem {
  section: string;
  kind: "numeral" | "entity";
  text: string;
  context: string;
}

export function flaggedItemsOf(result: VerificationResult, cap = 30): FlaggedItem[] {
  const items: FlaggedItem[] = [];
  for (const s of result.sections) {
    for (const n of s.unverified_numerals) {
      items.push({ section: s.section, kind: "numeral", text: n.raw, context: n.context });
    }
    for (const e of s.unverified_entities) {
      items.push({ section: s.section, kind: "entity", text: e, context: "" });
    }
  }
  return items.slice(0, cap);
}

export function buildAdjudicationPrompt(items: FlaggedItem[]): string {
  const list = items
    .map((it, i) => `${i + 1}. [${it.kind}] "${it.text}"${it.context ? ` — context: "${it.context}"` : ""} (section: ${it.section})`)
    .join("\n");
  return `A market-entry report was drafted strictly from a provided evidence pack. A deterministic checker flagged the items below because they do not literally appear in that evidence. Classify each one.

An item is FABRICATED when it asserts a specific fact (a figure, an organisation, a program, a person) that could only be true if it came from evidence — and it didn't. An item is BENIGN when it is: simple arithmetic on evidenced figures, a rounding/reformatting of an evidenced figure, a generic phrase or heading that merely looks like a name, a well-known public institution named in passing without a factual claim attached, or a date/timeline the report itself proposes.

Return ONLY a JSON array (no fences): [{"index": 1, "fabricated": true|false, "reason": "<=15 words"}] — one element per item, same order.

Items:
${list}`;
}

export function parseAdjudication(
  raw: string,
  itemCount: number,
): Array<{ index: number; fabricated: boolean; reason: string }> | null {
  try {
    const cleaned = (raw || "").replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;
    const out: Array<{ index: number; fabricated: boolean; reason: string }> = [];
    const seen = new Set<number>();
    for (const v of parsed) {
      if (typeof v !== "object" || v === null) return null;
      const o = v as Record<string, unknown>;
      const index = Number(o.index);
      if (!Number.isInteger(index) || index < 1 || index > itemCount) return null;
      if (seen.has(index)) return null; // duplicate verdict → reject the whole reply
      if (typeof o.fabricated !== "boolean") return null;
      seen.add(index);
      out.push({ index, fabricated: o.fabricated, reason: String(o.reason ?? "").slice(0, 200) });
    }
    // Require a verdict for EVERY flagged item: a partial reply would otherwise
    // let unlisted items default to not-fabricated, silently passing potential
    // fabrications in blocking mode. Reject → caller treats adjudication as
    // unavailable (fail-closed: no regeneration).
    if (seen.size !== itemCount) return null;
    return out;
  } catch {
    return null;
  }
}

/** Corrective note appended to a section's prompt when blocking mode
 *  regenerates it (regenerate once, then flag + soften). */
export function buildRegenerationNote(flagged: FlaggedItem[], sectionName: string): string {
  const relevant = flagged.filter((f) => f.section === sectionName);
  if (!relevant.length) return "";
  const list = relevant.map((f) => `- ${f.kind === "numeral" ? "figure" : "name"}: "${f.text}"`).join("\n");
  return `\n\nVERIFICATION FAILURE — REWRITE REQUIRED: Your previous draft of this section asserted the following facts that do NOT appear anywhere in the evidence provided to you:\n${list}\nRewrite the section WITHOUT these figures/names. Use only facts present in the provided data; where the evidence is silent, give qualitative guidance instead of specifics. Do not introduce any new figures or named organisations that are not in the provided data.`;
}
