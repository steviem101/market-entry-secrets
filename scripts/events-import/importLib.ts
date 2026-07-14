// MES-160 — Notion "MES Events" → Supabase `events` importer: pure logic.
//
// Everything in this module is side-effect free and unit-tested
// (importLib.test.ts). All I/O — reading the CSV file, querying live rows,
// writing artefacts, applying to production — lives in run.ts.
//
// Design constraints (verified against prod 2026-07-14):
//   - Target table is live `public.events`. Idempotency key: the Notion page
//     URL stored in `events.source_url` (partial unique index
//     events_source_url_uniq). Batch/audit log: existing `events_staging`
//     (run_id = batch id, target_event_id FK) — no migration required.
//   - Taxonomy is never invented: event types map through the fixed table
//     below (raw `events.type` values that MES-130's trigger buckets into
//     type_canonical); sector labels resolve only through the live
//     sector_vocabulary / sector-overrides mapping supplied by the caller.
//     Anything unresolvable becomes an exception row, not a guess.
//   - CSV free text is untrusted data: control characters are stripped,
//     whitespace collapsed and lengths capped before any value is used.

// ---------------------------------------------------------------------------
// CSV parsing (RFC 4180: quoted fields, embedded commas/quotes/newlines)
// ---------------------------------------------------------------------------

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/^\ufeff/, ""); // strip BOM
  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  // Drop fully-empty trailing rows (a final newline is not a record).
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

// ---------------------------------------------------------------------------
// The CSV contract (versioned Notion export — see README.md §CSV contract)
// ---------------------------------------------------------------------------

export const REQUIRED_HEADERS = [
  "event_name", "event_date_start", "event_date_end", "next_edition_expected",
  "venue", "city", "state", "organiser", "organiser_website", "website_url",
  "registration_url", "description", "target_audience", "event_type",
  "frequency", "recurring", "ticket_price_range_aud", "expected_attendance",
  "exhibitor_count", "sector_tags", "notes", "source_url", "notion_page_url",
] as const;

export type NotionHeader = (typeof REQUIRED_HEADERS)[number];
export type NotionEventRow = Record<NotionHeader, string> & { _line: number };

/** Validate headers and zip data rows into records. Throws on a broken contract. */
export function toRecords(rows: string[][]): NotionEventRow[] {
  if (rows.length === 0) throw new Error("CSV is empty");
  const headers = rows[0].map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
  }
  return rows.slice(1).map((r, idx) => {
    const rec = { _line: idx + 2 } as NotionEventRow;
    for (const h of REQUIRED_HEADERS) rec[h] = r[headers.indexOf(h)] ?? "";
    return rec;
  });
}

// ---------------------------------------------------------------------------
// Sanitisation — CSV free text is data, never instructions
// ---------------------------------------------------------------------------

/** Strip control/zero-width chars, collapse whitespace, trim, cap length. */
export function sanitizeText(value: string | null | undefined, maxLen: number): string {
  if (!value) return "";
  let s = String(value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f\u200b-\u200f\u2028\u2029\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > maxLen) s = s.slice(0, maxLen).trimEnd();
  return s;
}

/** Validate an http(s) URL; returns null (caller flags it) when unusable. */
export function sanitizeUrl(value: string | null | undefined): string | null {
  const s = sanitizeText(value, 500);
  if (!s) return null;
  if (!/^https?:\/\/[^\s"'<>]+$/i.test(s)) return null;
  return s;
}

export const TEXT_CAPS = {
  title: 200,
  description: 4000,
  short: 300, // venue, organiser, city, price labels, etc.
} as const;

// ---------------------------------------------------------------------------
// Fixed vocabularies (mirrors of live values — verified 2026-07-14)
// ---------------------------------------------------------------------------

/**
 * Notion event_type → raw `events.type` value. Targets are existing live
 * vocabulary where one exists; MES-130's events_type_canonical trigger then
 * derives the canonical filter bucket shown in brackets.
 * `awards_and_networking` has no existing raw value — "Awards + Networking"
 * is a new raw value that MES-130's lead-token heuristic buckets into
 * `networking`; it is reported in the taxonomy notes artefact for review.
 */
export const EVENT_TYPE_MAP: Record<string, string> = {
  conference_with_expo: "Conference + Expo", // → conference
  trade_exhibition: "Trade Exhibition", // → expo-trade-show
  industry_summit: "Summit", // → conference
  awards_and_networking: "Awards + Networking", // → networking (heuristic)
};

export const FREQUENCY_MAP: Record<string, string> = {
  annual: "Annual",
  biennial: "Biennial",
  multiple_per_year: "Multiple per year",
};

export const AU_STATES = new Set(["NSW", "VIC", "QLD", "WA", "SA", "ACT", "TAS", "NT", "National"]);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ---------------------------------------------------------------------------
// Dates. Live model: date (date) + event_date (timestamptz, UTC midnight by
// curated-row convention) + date_precision ('exact'|'month'|'tbc') +
// typical_month. There is no end-date column — event_date_end is preserved in
// the staging audit record only. Blanks stay blank: we never infer an exact
// date the researcher deliberately left unpublished.
// ---------------------------------------------------------------------------

export interface DateFields {
  date: string | null;
  event_date: string | null;
  date_precision: "exact" | "month" | "tbc";
  typical_month: string | null;
  flags: string[];
  /** Set when the row must be rejected (malformed, end before start). */
  error?: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDates(
  start: string,
  end: string,
  nextExpected: string,
  todayIso: string,
): DateFields {
  const flags: string[] = [];
  const s = start.trim();
  const e = end.trim();

  if (s) {
    if (!ISO_DATE.test(s)) {
      return { date: null, event_date: null, date_precision: "tbc", typical_month: null, flags, error: `event_date_start is not YYYY-MM-DD: "${s}"` };
    }
    if (e) {
      if (!ISO_DATE.test(e)) {
        return { date: null, event_date: null, date_precision: "tbc", typical_month: null, flags, error: `event_date_end is not YYYY-MM-DD: "${e}"` };
      }
      if (e < s) {
        return { date: null, event_date: null, date_precision: "tbc", typical_month: null, flags, error: `event_date_end ${e} is before event_date_start ${s}` };
      }
    }
    if (s < todayIso) flags.push("date_in_past");
    return { date: s, event_date: `${s}T00:00:00Z`, date_precision: "exact", typical_month: null, flags };
  }

  // No verified start date: at best month-level from the expected-edition text.
  const expected = sanitizeText(nextExpected, 300);
  const m = expected.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b(?:[^0-9]{0,20}(\d{4}))?/i,
  );
  if (m) {
    const month = MONTHS.find((x) => x.toLowerCase() === m[1].toLowerCase())!;
    const year = m[2];
    if (year) {
      const mm = String(MONTHS.indexOf(month) + 1).padStart(2, "0");
      flags.push("date_expected_only");
      return {
        date: `${year}-${mm}-01`,
        event_date: `${year}-${mm}-01T00:00:00Z`,
        date_precision: "month",
        typical_month: month,
        flags,
      };
    }
    flags.push("date_unpublished");
    return { date: null, event_date: null, date_precision: "tbc", typical_month: month, flags };
  }
  flags.push("date_unpublished");
  return { date: null, event_date: null, date_precision: "tbc", typical_month: null, flags };
}

// ---------------------------------------------------------------------------
// Counts ("5,000+", "450", "c. 300 exhibitors")
// ---------------------------------------------------------------------------

export function parseCount(raw: string): { n: number | null; label: string | null } {
  const label = sanitizeText(raw, 100) || null;
  if (!label) return { n: null, label: null };
  const digits = label.replace(/,/g, "").match(/\d+/);
  return { n: digits ? Number(digits[0]) : null, label };
}

// ---------------------------------------------------------------------------
// Titles, slugs, matching
// ---------------------------------------------------------------------------

/** Normalise a title into a comparison key (ascii fold, drop years/noise). */
export function normTitle(title: string): string {
  let t = title.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  t = t.toLowerCase().replace(/&/g, " and ");
  t = t.replace(/[^a-z0-9]+/g, " ").trim();
  t = t
    .split(" ")
    .filter((w) => w && !/^(19|20)\d{2}$/.test(w) && !["the", "australia", "australian"].includes(w))
    .join(" ");
  return t;
}

/** Character-bigram Dice similarity over normalised titles (deterministic). */
export function diceSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      map.set(g, (map.get(g) ?? 0) + 1);
    }
    return map;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  let overlap = 0;
  let sizeA = 0;
  let sizeB = 0;
  for (const v of A.values()) sizeA += v;
  for (const v of B.values()) sizeB += v;
  for (const [g, v] of A) overlap += Math.min(v, B.get(g) ?? 0);
  return (2 * overlap) / (sizeA + sizeB);
}

/** Mirror of the DB generate_slug(): lower, non-alnum → '-', trim, ≤80. */
export function makeSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Deterministic collision-safe slug: base → base-city → base-2..base-9. */
export function assignSlug(title: string, city: string, taken: Set<string>): string {
  const base = makeSlug(title) || "event";
  if (!taken.has(base)) return base;
  const withCity = city ? `${base}-${makeSlug(city)}`.slice(0, 80) : "";
  if (withCity && !taken.has(withCity)) return withCity;
  for (let n = 2; n <= 9; n++) {
    const cand = `${base}-${n}`;
    if (!taken.has(cand)) return cand;
  }
  throw new Error(`Could not find a free slug for "${title}"`);
}

// ---------------------------------------------------------------------------
// Sector taxonomy resolution (table-driven; nothing is invented here)
// ---------------------------------------------------------------------------

export interface TaxonomyContext {
  /** lower-cased raw label → canonical sector slugs (live sector_vocabulary + repo overrides). */
  sectorVocab: Map<string, string[]>;
  /** Valid canonical slugs (live sector_group_crosswalk.v2_sector_slug ∪ sectors-derived). */
  validSlugs: Set<string>;
  /** lower-cased raw label → live display category (repo overrides file). */
  categoryByLabel: Map<string, string>;
}

export interface SectorResolution {
  slugs: string[];
  category: string | null;
  /** Labels that resolved nowhere — reported as taxonomy exceptions. */
  unmapped: string[];
}

export function resolveSectors(rawTags: string, taxonomy: TaxonomyContext): SectorResolution {
  const labels = rawTags
    .split(/[;,]/)
    .map((s) => sanitizeText(s, 100))
    .filter(Boolean);
  const slugs = new Set<string>();
  const unmapped: string[] = [];
  let category: string | null = null;
  for (const label of labels) {
    const key = label.toLowerCase();
    const mapped = taxonomy.sectorVocab.get(key);
    if (mapped && mapped.length > 0) {
      for (const slug of mapped) {
        if (taxonomy.validSlugs.has(slug)) slugs.add(slug);
        else unmapped.push(`${label} → invalid slug "${slug}"`);
      }
    } else {
      unmapped.push(label);
    }
    if (!category) category = taxonomy.categoryByLabel.get(key) ?? null;
  }
  return { slugs: [...slugs].sort(), category, unmapped };
}

// ---------------------------------------------------------------------------
// Live rows + proposals
// ---------------------------------------------------------------------------

/** The live `events` columns the importer reads for matching and diffing. */
export interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  source: string | null;
  source_url: string | null;
  description: string;
  date: string | null;
  event_date: string | null;
  date_precision: string;
  typical_month: string | null;
  venue: string | null;
  city: string | null;
  state_region: string | null;
  location: string;
  type: string;
  category: string;
  sector: string | null;
  sector_tags: string[] | null;
  organizer: string | null;
  organizer_website: string | null;
  website_url: string | null;
  registration_url: string | null;
  price: string | null;
  frequency: string | null;
  attendees: number;
  attendees_label: string | null;
  exhibitors: number | null;
  exhibitors_label: string | null;
  data_quality_flags: string[] | null;
}

/** Full insert payload for `events` (only columns the importer sets). */
export type EventInsert = Record<string, unknown>;

export interface FieldOp {
  field: string;
  from: unknown;
  to: unknown;
  rule: "fill_blank" | "overwrite_date" | "adopt_source_url" | "append_flag";
}

export interface InsertProposal {
  kind: "insert";
  line: number;
  title: string;
  slug: string;
  payload: EventInsert;
  flags: string[];
  stagingRaw: Record<string, unknown>;
}

export interface UpdateProposal {
  kind: "update";
  line: number;
  title: string;
  targetId: string;
  targetTitle: string;
  targetSource: string | null;
  matchType: "source_url" | "title_exact";
  ops: FieldOp[];
  preImage: Record<string, unknown>;
  stagingRaw: Record<string, unknown>;
}

export interface AmbiguousMatch {
  kind: "ambiguous";
  line: number;
  title: string;
  reason: string;
  candidates: Array<{ id: string; title: string; city: string | null; date: string | null; source: string | null; similarity: number }>;
}

export interface InvalidRow {
  kind: "invalid";
  line: number;
  title: string;
  errors: string[];
}

export interface TaxonomyException {
  kind: "taxonomy";
  line: number;
  title: string;
  issues: string[];
}

export interface UnchangedRow {
  kind: "unchanged";
  line: number;
  title: string;
  targetId: string;
}

export interface ProposalSet {
  inserts: InsertProposal[];
  updates: UpdateProposal[];
  ambiguous: AmbiguousMatch[];
  invalid: InvalidRow[];
  taxonomyExceptions: TaxonomyException[];
  unchanged: UnchangedRow[];
  taxonomyNotes: string[];
}

export interface BuildOptions {
  batchId: string;
  todayIso: string;
  /** Explicit reviewer override: import rows with no resolvable category using this live label. */
  fallbackCategory?: string;
  /** Status new rows land with. Default 'approved' — the human gate is artefact review before --apply. */
  insertStatus?: "approved" | "needs_review";
}

/** Ambiguity band: below EXACT match but similar enough to need human review. */
export const AMBIGUOUS_SIMILARITY = 0.82;

const IMPORT_SOURCE = "notion_mes_events";

function cityCompatible(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return true;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function batchFlag(batchId: string): string {
  return `import_batch:${batchId}`;
}

/** Compose the NOT NULL display location the way curated rows do ("Sydney, NSW"). */
export function composeLocation(city: string, state: string): string {
  const parts = [city, state && state !== "National" ? state : ""].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return state === "National" ? "Australia" : "Australia";
}

/**
 * The core planner: classify every CSV row into insert / update / ambiguous /
 * invalid / taxonomy-exception, against both the live rows and the batch
 * itself. Pure and deterministic (row order = CSV order).
 */
export function buildProposals(
  records: NotionEventRow[],
  liveEvents: LiveEvent[],
  taxonomy: TaxonomyContext,
  opts: BuildOptions,
): ProposalSet {
  const out: ProposalSet = {
    inserts: [], updates: [], ambiguous: [], invalid: [],
    taxonomyExceptions: [], unchanged: [], taxonomyNotes: [],
  };

  // Match pool: rejected rows are moderation junk — never resurrect or match them.
  const pool = liveEvents.filter((e) => e.status !== "rejected");
  const bySourceUrl = new Map<string, LiveEvent>();
  const byNorm = new Map<string, LiveEvent[]>();
  for (const e of pool) {
    if (e.source_url) bySourceUrl.set(e.source_url, e);
    const n = normTitle(e.title);
    if (n) byNorm.set(n, [...(byNorm.get(n) ?? []), e]);
  }

  const takenSlugs = new Set(liveEvents.map((e) => e.slug));
  const seenNotionUrls = new Map<string, number>();
  const seenNorms = new Map<string, number>();
  const unmappedEventTypes = new Set<string>();

  for (const rec of records) {
    const title = sanitizeText(rec.event_name, TEXT_CAPS.title);
    const errors: string[] = [];
    const flags: string[] = [batchFlag(opts.batchId)];

    if (!title) errors.push("event_name is required");
    const notionUrl = sanitizeUrl(rec.notion_page_url);
    if (!notionUrl) errors.push("notion_page_url is required (provenance / idempotency key)");
    else if (seenNotionUrls.has(notionUrl)) {
      errors.push(`duplicate notion_page_url within batch (first seen line ${seenNotionUrls.get(notionUrl)})`);
    }

    const state = sanitizeText(rec.state, 20);
    if (state && !AU_STATES.has(state)) errors.push(`unknown state "${state}" (expected ${[...AU_STATES].join("/")})`);

    const dates = parseDates(rec.event_date_start, rec.event_date_end, rec.next_edition_expected, opts.todayIso);
    if (dates.error) errors.push(dates.error);
    flags.push(...dates.flags);

    const norm = normTitle(title);
    if (norm && seenNorms.has(norm)) {
      errors.push(`duplicate event title within batch (first seen line ${seenNorms.get(norm)})`);
    }

    if (errors.length > 0) {
      out.invalid.push({ kind: "invalid", line: rec._line, title: title || "(untitled)", errors });
      continue;
    }
    seenNotionUrls.set(notionUrl!, rec._line);
    if (norm) seenNorms.set(norm, rec._line);

    // --- taxonomy resolution (gating is branch-specific below) ---
    // A non-blank sector label that resolves nowhere blocks the row outright:
    // it means the mapping table is incomplete and needs a reviewed override.
    // The insert-only requirements (event type, NOT NULL category) are checked
    // in the insert branch — a matched live row already has both.
    const rawType = sanitizeText(rec.event_type, 60).toLowerCase();
    const mappedType = rawType ? EVENT_TYPE_MAP[rawType] : undefined;
    if (rawType && !mappedType) unmappedEventTypes.add(rawType);
    const sectors = resolveSectors(rec.sector_tags, taxonomy);
    if (sectors.unmapped.length > 0) {
      out.taxonomyExceptions.push({
        kind: "taxonomy", line: rec._line, title,
        issues: sectors.unmapped.map((u) => `unmapped sector label "${u}"`),
      });
      continue;
    }
    let category = sectors.category;
    if (!category && opts.fallbackCategory) {
      category = opts.fallbackCategory;
      flags.push("category_fallback");
    }

    // --- normalised field values ---
    const city = sanitizeText(rec.city, 100);
    const venue = sanitizeText(rec.venue, TEXT_CAPS.short);
    const organiser = sanitizeText(rec.organiser, TEXT_CAPS.short);
    const description = sanitizeText(rec.description, TEXT_CAPS.description);
    const price = sanitizeText(rec.ticket_price_range_aud, TEXT_CAPS.short);
    const frequency = FREQUENCY_MAP[sanitizeText(rec.frequency, 40).toLowerCase()] ?? null;
    const attendance = parseCount(rec.expected_attendance);
    const exhibitors = parseCount(rec.exhibitor_count);
    const websiteUrl = sanitizeUrl(rec.website_url);
    if (rec.website_url.trim() && !websiteUrl) flags.push("invalid_url:website_url");
    const registrationUrl = sanitizeUrl(rec.registration_url);
    if (rec.registration_url.trim() && !registrationUrl) flags.push("invalid_url:registration_url");
    const organiserWebsite = sanitizeUrl(rec.organiser_website);
    if (rec.organiser_website.trim() && !organiserWebsite) flags.push("invalid_url:organiser_website");
    const researchSourceUrl = sanitizeUrl(rec.source_url);

    // Staging-only editorial/triage fields — never written to live columns,
    // therefore never embedded into mes_knowledge_base.
    const stagingRaw: Record<string, unknown> = {
      batch_id: opts.batchId,
      csv_line: rec._line,
      notion_page_url: notionUrl,
      research_source_url: researchSourceUrl,
      event_date_end: rec.event_date_end.trim() || null,
      next_edition_expected: sanitizeText(rec.next_edition_expected, TEXT_CAPS.short) || null,
      target_audience: sanitizeText(rec.target_audience, TEXT_CAPS.short) || null,
      notes: sanitizeText(rec.notes, 1000) || null,
      recurring: rec.recurring.trim() || null,
    };

    // --- match cascade ---
    const srcMatch = bySourceUrl.get(notionUrl!);
    const titleMatches = norm ? (byNorm.get(norm) ?? []) : [];
    let target: LiveEvent | null = null;
    let matchType: "source_url" | "title_exact" | null = null;

    if (srcMatch) {
      target = srcMatch;
      matchType = "source_url";
    } else if (titleMatches.length === 1 && cityCompatible(city, titleMatches[0].city)) {
      target = titleMatches[0];
      matchType = "title_exact";
    } else if (titleMatches.length > 0) {
      out.ambiguous.push({
        kind: "ambiguous", line: rec._line, title,
        reason: titleMatches.length > 1 ? "multiple exact-title matches" : `exact-title match in a different city (${titleMatches[0].city ?? "?"} vs ${city || "?"})`,
        candidates: titleMatches.map((e) => ({ id: e.id, title: e.title, city: e.city, date: e.date, source: e.source, similarity: 1 })),
      });
      continue;
    } else {
      // Fuzzy band: similar-but-not-identical titles need a human decision.
      const scored = pool
        .map((e) => ({ e, sim: diceSimilarity(norm, normTitle(e.title)) }))
        .filter((x) => x.sim >= AMBIGUOUS_SIMILARITY)
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 3);
      if (scored.length > 0) {
        out.ambiguous.push({
          kind: "ambiguous", line: rec._line, title,
          reason: `similar existing title(s) at ${scored[0].sim.toFixed(2)} similarity — review before import`,
          candidates: scored.map(({ e, sim }) => ({ id: e.id, title: e.title, city: e.city, date: e.date, source: e.source, similarity: Number(sim.toFixed(3)) })),
        });
        continue;
      }
    }

    if (target && matchType) {
      // --- per-field update (fill-blank-only, plus reviewed date refresh) ---
      const ops: FieldOp[] = [];
      const preImage: Record<string, unknown> = {};
      const fill = (field: keyof LiveEvent & string, to: unknown, isBlank: (v: unknown) => boolean) => {
        const from = target![field];
        if (to !== null && to !== "" && isBlank(from)) {
          ops.push({ field, from, to, rule: "fill_blank" });
          preImage[field] = from;
        }
      };
      const blankText = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

      fill("venue", venue, blankText);
      fill("city", city, blankText);
      fill("state_region", state, blankText);
      fill("organizer", organiser, (v) => blankText(v) || v === "TBC");
      fill("organizer_website", organiserWebsite, blankText);
      fill("website_url", websiteUrl, blankText);
      fill("registration_url", registrationUrl, blankText);
      fill("price", price, blankText);
      fill("frequency", frequency, blankText);
      fill("typical_month", dates.typical_month, blankText);
      fill("description", description, blankText);
      if (attendance.n !== null && (!target.attendees || target.attendees === 0)) {
        ops.push({ field: "attendees", from: target.attendees, to: attendance.n, rule: "fill_blank" });
        preImage.attendees = target.attendees;
      }
      fill("attendees_label", attendance.label, blankText);
      if (exhibitors.n !== null && target.exhibitors === null) {
        ops.push({ field: "exhibitors", from: target.exhibitors, to: exhibitors.n, rule: "fill_blank" });
        preImage.exhibitors = target.exhibitors;
      }
      fill("exhibitors_label", exhibitors.label, blankText);
      if ((target.sector_tags ?? []).length === 0 && sectors.slugs.length > 0) {
        ops.push({ field: "sector_tags", from: target.sector_tags, to: sectors.slugs, rule: "fill_blank" });
        preImage.sector_tags = target.sector_tags;
      }

      // Verified fresh exact date beats an approximate or stale one; never downgrade.
      if (dates.date_precision === "exact" && (target.date_precision !== "exact" || target.date !== dates.date)) {
        for (const [field, to] of [["date", dates.date], ["event_date", dates.event_date], ["date_precision", "exact"]] as const) {
          if (target[field as keyof LiveEvent] !== to) {
            ops.push({ field, from: target[field as keyof LiveEvent], to, rule: "overwrite_date" });
            preImage[field] = target[field as keyof LiveEvent];
          }
        }
      }

      // Adopt the row into the Notion idempotency key when it has no source_url.
      if (!target.source_url) {
        ops.push({ field: "source_url", from: null, to: notionUrl, rule: "adopt_source_url" });
        preImage.source_url = null;
      }

      if (ops.length === 0) {
        out.unchanged.push({ kind: "unchanged", line: rec._line, title, targetId: target.id });
        continue;
      }

      // Batch provenance on the touched row.
      const existingFlags = target.data_quality_flags ?? [];
      if (!existingFlags.includes(batchFlag(opts.batchId))) {
        ops.push({ field: "data_quality_flags", from: existingFlags, to: [...existingFlags, batchFlag(opts.batchId)], rule: "append_flag" });
        preImage.data_quality_flags = existingFlags;
      }

      out.updates.push({
        kind: "update", line: rec._line, title,
        targetId: target.id, targetTitle: target.title, targetSource: target.source,
        matchType, ops, preImage,
        stagingRaw: { ...stagingRaw, action: "update", match_type: matchType, pre_image: preImage },
      });
      continue;
    }

    // --- insert (this branch needs a mapped type and a NOT NULL category) ---
    const insertIssues: string[] = [];
    if (!mappedType) insertIssues.push(rawType ? `unmapped event_type "${rawType}"` : "event_type is blank");
    if (!category) insertIssues.push("no resolvable category (sector_tags blank or unmapped; category is NOT NULL in live schema)");
    if (insertIssues.length > 0) {
      out.taxonomyExceptions.push({ kind: "taxonomy", line: rec._line, title, issues: insertIssues });
      continue;
    }
    const slug = assignSlug(title, city, takenSlugs);
    takenSlugs.add(slug);
    const payload: EventInsert = {
      title,
      slug,
      description: description || title,
      date: dates.date,
      event_date: dates.event_date,
      date_precision: dates.date_precision,
      typical_month: dates.typical_month,
      venue: venue || null,
      city: city || null,
      state_region: state || null,
      location: composeLocation(city, state),
      country: "AU",
      event_format: "in_person",
      type: mappedType,
      category,
      sector: category,
      sector_tags: sectors.slugs,
      organizer: organiser || null,
      organizer_website: organiserWebsite,
      website_url: websiteUrl,
      registration_url: registrationUrl,
      price: price || null,
      frequency: frequency ?? "Annual",
      ...(attendance.n !== null ? { attendees: attendance.n } : {}),
      attendees_label: attendance.label,
      exhibitors: exhibitors.n,
      exhibitors_label: exhibitors.label,
      source: IMPORT_SOURCE,
      source_url: notionUrl,
      status: opts.insertStatus ?? "approved",
      data_quality_flags: flags,
      ingested_at: null, // set at apply time
    };
    out.inserts.push({
      kind: "insert", line: rec._line, title, slug, payload, flags,
      stagingRaw: { ...stagingRaw, action: "insert" },
    });
  }

  for (const t of unmappedEventTypes) {
    out.taxonomyNotes.push(`event_type "${t}" has no mapping in EVENT_TYPE_MAP`);
  }
  if (records.length > 0) {
    out.taxonomyNotes.push(
      `event_type mappings in use: ${Object.entries(EVENT_TYPE_MAP).map(([k, v]) => `${k} → "${v}"`).join("; ")}`,
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// Artefact serialisation helpers (pure)
// ---------------------------------------------------------------------------

export function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n") + "\n";
}
