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
    // em-dash → comma-space. Only HORIZONTAL whitespace around it is consumed:
    // matching \n here would pull a following list item / heading / paragraph
    // onto the previous line (a "— \n- next" bullet fuses into the prose above).
    .replace(/[ \t]*—[ \t]*/g, ", ")
    .replace(/,[ \t]*,/g, ",") // collapse a doubled comma (same line)
    .replace(/,[ \t]*([.!?;:)\]])/g, "$1") // drop a comma now sitting before end punctuation / a closer
    .replace(/([(\[])[ \t]*,[ \t]*/g, "$1") // ...or just after an opener
    .replace(/(^|\n)[ \t]*,[ \t]*/g, "$1") // ...or at the very start of the text / a line
    .replace(/,[ \t]+(\n|$)/g, ",$1") // ...or a space the swap left between a comma and a line end (an em-dash that ended a line)
    // tidy INTERIOR double spaces the swap introduced, but never touch leading
    // indentation (nested list items) or a trailing "  \n" markdown hard break —
    // this runs on every section, em-dashes or not, so it must not reflow layout.
    .replace(/(?<=\S)[ \t]{2,}(?=\S)/g, " ");
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
      // `meta_description` is the guide/content card blurb (report_v2 promotes it
      // to the visible card text), so it needs the same strip as description.
      for (const field of ["description", "subtitle", "meta_description"] as const) {
        if (typeof next[field] === "string") next[field] = deEmDash(next[field]);
      }
      return next;
    });
  }
  return out;
}

/**
 * Strip em-dashes from a list of prose strings (e.g. the customer's own
 * site-derived strengths that render in the competitor "you" row). Non-strings
 * pass through; non-arrays return `[]`.
 */
export function deEmDashList(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((s) => (typeof s === "string" ? deEmDash(s) : s));
}

/**
 * Strip em-dashes from the prose fields of key-metric tiles (`label`, `value`,
 * `context`). These render as the metric cards ABOVE the sections, so an
 * em-dash there is just as visible as one in the prose. Value ranges use
 * EN-dashes ("$2m–$5m"), which deEmDash deliberately leaves untouched. Other
 * fields (e.g. `estimated`) pass through unchanged.
 */
// deno-lint-ignore no-explicit-any
export function deEmDashKeyMetrics(metrics: unknown): any[] {
  if (!Array.isArray(metrics)) return [];
  return metrics.map((m) => {
    if (!m || typeof m !== "object") return m;
    const next = { ...m };
    for (const field of ["label", "value", "context"] as const) {
      if (typeof next[field] === "string") next[field] = deEmDash(next[field]);
    }
    return next;
  });
}
