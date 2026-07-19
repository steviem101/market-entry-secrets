// numericHygiene.ts — the "no dated figures" backstop (Sub-ticket 2B).
//
// Insight cards must be DURABLE. "Australia applies payroll tax with state-level
// thresholds" is durable; "$25,000 threshold" from a 2016 PDF is poison. The distiller
// PROMPT instructs Haiku to generalise dated numeric claims; this is the backstop that
// catches ones that slipped through, so a specific stale figure never enters the KB.

/** True if the text contains a specific dated/quantitative figure that should have been
 *  generalised (currency amounts, explicit percentage rates, "<threshold/fee> of <n>"). */
export function hasDatedFigure(text: string): boolean {
  if (!text) return false;
  // Currency amounts: $, A$, US$, AUD/USD, £, € followed by a number (optionally k/m/bn).
  if (/(?:A\$|US\$|\$|AUD|USD|£|€)\s?\d[\d,.]*\s?(?:k|m|bn|million|billion|thousand)?\b/i.test(text)) return true;
  // Explicit percentage rates (tax rates, growth figures): "25%", "25 per cent".
  // No trailing \b — "%" is not a word char, so \b would fail right after it.
  if (/\b\d{1,3}(?:\.\d+)?\s?(?:%|per\s?cent|percent)/i.test(text)) return true;
  // "threshold/fee/levy/rate/deposit/minimum of 25,000".
  if (/\b(threshold|fee|levy|rate|charge|deposit|minimum|cap|limit)\s+of\s+\d[\d,]*/i.test(text)) return true;
  // Explicit money amount written out: "25,000 dollars" / "1,000 AUD".
  if (/\b\d{1,3}(?:,\d{3})+\s?(?:dollars?|aud|usd)\b/i.test(text)) return true;
  return false;
}

/** A small round year like 2016/2024 embedded in a claim is a staleness smell (a claim
 *  pinned to a specific year rather than a durable statement). Used as a soft signal. */
export function mentionsSpecificYear(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text ?? "");
}
