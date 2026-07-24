/**
 * Resolve the effective country of origin for the report intake (PD-7).
 *
 * The country dropdown offers a fixed list plus an "Other" escape hatch. Before PD-7,
 * picking "Other" wrote the literal string "Other" as country_of_origin, so the report
 * read "…entering from Other" and the origin-corridor / country-page lookups matched
 * nothing. When "Other" is chosen the wizard now shows a free-text box; this resolves
 * that free text into the real country so downstream prose + matching use it. Empty
 * free text falls back to "Other" (no worse than before).
 *
 * Pure module — no imports — importable by the schema shim AND unit-tested under Node.
 */
export function resolveCountryOfOrigin(country: string, other?: string | null): string {
  if (country === "Other") {
    const t = (other ?? "").trim();
    return t || "Other";
  }
  return country;
}
