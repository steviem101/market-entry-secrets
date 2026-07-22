// Deterministic prose post-processing for report sections (MES-217 / F2 · E1).
//
// Prompt-only enforcement failed: the Floats smoke-test report generated AFTER
// the Wave 5 "no em-dashes" prompt rule still had em-dashes throughout. This is
// the deterministic enforcement layer — it runs in buildReportJson so both the
// polished and unpolished stored snapshots are clean.
//
// PURE (no Deno APIs) so it runs under `npm test`.

/**
 * Replace em-dashes (—, U+2014 — the "long dash" the owner repeatedly flagged)
 * used as clause separators with a comma. Deliberately leaves EN-dashes (—'s
 * shorter cousin, used in ranges like "2026–2027" / "SEPT 2026 – JUN 2027") and
 * hyphens (compound words like "AI-powered") untouched. Idempotent; safe on
 * empty/undefined.
 */
export function deEmDash(text: string): string {
  if (!text) return text;
  return text
    .replace(/\s*—\s*/g, ", ") // em-dash (any surrounding whitespace) → comma-space
    .replace(/,\s*,/g, ",") // collapse a doubled comma
    .replace(/,\s*([.!?;:)\]])/g, "$1") // drop a comma now sitting before end punctuation / a closer
    .replace(/([(\[])\s*,\s*/g, "$1") // ...or just after an opener
    .replace(/(^|\n)[ \t]*,[ \t]*/g, "$1") // ...or at the very start of the text / a line
    .replace(/[ \t]{2,}/g, " "); // tidy any double spaces the swap introduced
}

/**
 * Apply deEmDash to every section's `content`. Non-string/absent content and
 * any other section fields pass through unchanged.
 */
// deno-lint-ignore no-explicit-any
export function deEmDashSections(sections: Record<string, any>): Record<string, any> {
  // deno-lint-ignore no-explicit-any
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(sections)) {
    out[k] = v && typeof v.content === "string" ? { ...v, content: deEmDash(v.content) } : v;
  }
  return out;
}

/**
 * Apply deEmDash to the card-copy fields (`description`, `subtitle`) of every
 * match. These render directly on the report cards (event blurbs, provider /
 * mentor / investor descriptions), so em-dashes there must be stripped too —
 * section prose isn't the only surface (mes-qa follow-up).
 */
// deno-lint-ignore no-explicit-any
export function deEmDashMatches(matches: Record<string, any>): Record<string, any> {
  // deno-lint-ignore no-explicit-any
  const out: Record<string, any> = {};
  for (const [cat, arr] of Object.entries(matches)) {
    if (!Array.isArray(arr)) {
      out[cat] = arr;
      continue;
    }
    out[cat] = arr.map((m) => {
      if (!m || typeof m !== "object") return m;
      const next = { ...m };
      if (typeof next.description === "string") next.description = deEmDash(next.description);
      if (typeof next.subtitle === "string") next.subtitle = deEmDash(next.subtitle);
      return next;
    });
  }
  return out;
}
