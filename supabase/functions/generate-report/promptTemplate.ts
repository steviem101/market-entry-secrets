/**
 * Report-template rendering: Mustache-style conditional blocks + variable substitution.
 *
 * Pure module (no Deno globals / I/O) so it's unit-testable under `node --test` like
 * matchScoring.ts / sectorTaxonomy.ts. Extracted from index.ts so the "empty value"
 * rule has one definition and a test.
 *
 * The matched-entity variables are JSON-stringified arrays/objects (e.g.
 * `matched_trade_investment_agencies_json` = `JSON.stringify(matches.x || [])`), so an
 * empty match set arrives as the literal string "[]" (or "{}"), NOT "" or absent. A
 * conditional block must treat those as empty too — otherwise a `{{#var}}...{{/var}}`
 * subsection (e.g. "Trade & Government Support") renders its heading with an empty `[]`
 * payload even when nothing matched, inviting an empty or hallucinated subsection.
 */

/** True when a template value carries no real content: blank, the "Not specified"
 *  sentinel, or a stringified-empty JSON array/object ("[]" / "{}"). */
export function isEmptyTemplateValue(val: string | undefined | null): boolean {
  const v = (val ?? "").trim();
  return !v || v === "Not specified" || v === "[]" || v === "{}";
}

/** Render `{{#var}}...{{/var}}` blocks: keep the inner block only when the variable is
 *  non-empty (see isEmptyTemplateValue), otherwise drop it. Supports any number of blocks. */
export function renderConditionalBlocks(prompt: string, variables: Record<string, string>): string {
  return prompt.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match: string, varName: string, block: string) =>
      isEmptyTemplateValue(variables[varName]) ? "" : block,
  );
}

/** Replace every `{{key}}` with its value. Uses a function replacement so `$` sequences
 *  in scraped/research values ($&, $$, $`, $') are NOT interpreted as String.replace
 *  replacement patterns and corrupt the prompt. */
export function substituteVariables(prompt: string, variables: Record<string, string>): string {
  let out = prompt;
  for (const [key, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), () => value);
  }
  return out;
}

/** Full template render: drop empty conditional blocks first, then substitute variables. */
export function renderTemplate(prompt: string, variables: Record<string, string>): string {
  return substituteVariables(renderConditionalBlocks(prompt, variables), variables);
}
