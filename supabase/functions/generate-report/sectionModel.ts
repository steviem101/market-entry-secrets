// MES-148 Phase 2a — per-section model routing (pure logic, node --test).
//
// Each report_templates row may carry an optional `model` override. The section
// writer resolves the model as: row override → env default → hardcoded flash.
// Default behaviour is unchanged (null column + no env => today's Gemini flash),
// so this is the config lever the money-section A/B needs, not a behaviour change.
//
// The AI gateway is the transport (a config flip, not an architecture change —
// MES-148 Phase 2). Only set a section's model to one the gateway actually
// serves, and validate the change through the golden harness before promoting.

/** The pipeline's historical section-writer model. */
export const FLASH_MODEL = "google/gemini-3-flash-preview";

/** True when a resolved section model is an Anthropic (Claude) model — these are
 *  called via the DIRECT Anthropic API, not the Lovable gateway (which only serves
 *  Gemini here). Accepts a bare id ("claude-sonnet-5") or an "anthropic/"-prefixed
 *  one; anything else (e.g. "google/gemini-3-flash-preview") is a gateway model. */
export function isAnthropicModel(model: string | null | undefined): boolean {
  return /^(anthropic\/)?claude-/i.test((model ?? "").trim());
}

/** The bare Anthropic model id for the API (strips an optional "anthropic/"). */
export function anthropicModelId(model: string): string {
  return model.trim().replace(/^anthropic\//i, "");
}

/** Whether a failed section write should retry once on the Gemini flash writer.
 *  True only for a direct-Anthropic model (the gateway path already can't hit the
 *  Anthropic-specific failure modes) that resolved from config — NOT from an eval
 *  A/B override. Rationale: `report_templates.model = claude-*` promotes real,
 *  every-report sections; an Anthropic outage/credit/access failure must degrade
 *  to flash prose, not silently blank the section. But an eval-override failure
 *  must stay loud so the money-section guard (run-goldens) catches it — so eval
 *  runs never fall back. */
export function shouldFallbackToFlash(model: string, isEvalOverride: boolean): boolean {
  return isAnthropicModel(model) && !isEvalOverride;
}

/** Resolve the model for one section.
 *  @param rowModel   report_templates.model (null/blank when unset)
 *  @param envDefault SECTION_MODEL_DEFAULT env (blank when unset)
 *  Row override wins; then a global env default; then flash. Whitespace-only
 *  values are treated as unset so a stray "" in config can't blank the model. */
export function resolveSectionModel(
  rowModel: string | null | undefined,
  envDefault: string | null | undefined,
): string {
  const row = (rowModel ?? "").trim();
  if (row) return row;
  const env = (envDefault ?? "").trim();
  if (env) return env;
  return FLASH_MODEL;
}

/** Per-section model map for telemetry (report_json.metadata.section_models),
 *  so an A/B is observable per report without re-deriving the config. */
export function sectionModelMap(
  templates: Array<{ section_name: string; model?: string | null }>,
  envDefault: string | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of templates || []) {
    if (!t?.section_name) continue;
    out[t.section_name] = resolveSectionModel(t.model, envDefault);
  }
  return out;
}
