/**
 * Card display-field helpers for generate-report match cards.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / semanticMatch.ts.
 *
 * Why it exists (Stage 5 render bug B5): several card subtitles were built with
 * raw template literals — `${e.date} · ${e.location}`, `${i.investor_type} · ${i.location}`,
 * `${l.location ?? ""} · ${l.record_count ?? "?"} records` — so a missing field
 * rendered the literal string "null"/"undefined", a dangling separator (" · 5000
 * records"), or a lone bullet. `metaLine` drops empty/nullish/placeholder parts and
 * only joins what's real, returning `undefined` when nothing survives (so the card's
 * `subtitle && <p>` guard hides the line entirely rather than showing an empty bullet).
 */

/** Tokens that mean "no value" if a stringified field slips through as one of them. */
const BLANK_TOKENS = new Set(["null", "undefined", "nan", "n/a", "na", "-", "?", "undefined records"]);

/** True if a subtitle part carries no real information. */
function isBlankPart(part: unknown): boolean {
  if (part == null) return true;
  const s = String(part).trim();
  if (s === "") return true;
  return BLANK_TOKENS.has(s.toLowerCase());
}

/**
 * Join subtitle parts with `sep`, dropping any null/undefined/empty/placeholder part.
 * Returns `undefined` (not "") when nothing survives, so callers can rely on a falsy
 * subtitle to hide the line. Parts are stringified and trimmed.
 */
export function metaLine(parts: Array<unknown>, sep = " · "): string | undefined {
  const kept = parts.filter((p) => !isBlankPart(p)).map((p) => String(p).trim());
  return kept.length ? kept.join(sep) : undefined;
}

/**
 * Format a record-count into a "1,234 records" fragment, or undefined when the count
 * is missing/zero/unparseable. Used by the lead-database subtitle so a dataset with an
 * unknown size shows just its location instead of "Sydney · ? records".
 */
export function recordCountLabel(count: unknown): string | undefined {
  const n = typeof count === "number" ? count : Number(count);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return `${Math.round(n).toLocaleString("en-US")} records`;
}
