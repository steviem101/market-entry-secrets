// Per-run cost attribution for the report pipeline (MES-219).
//
// Pure module (no Deno / no I/O) so it is unit-testable under `node --test` and
// reusable. index.ts meters real AI token usage via the optional onUsage hook on
// callAI/callAnthropicChat, collects it here, and combines it with the Firecrawl
// op count into an ESTIMATED USD cost for internal ops visibility (not billing).

export type TokenUsage = { input: number; output: number };
export type AiUsageEntry = { model: string; input: number; output: number };

// Rough public list prices (USD per 1M tokens). Estimates — update as vendor
// pricing changes. Unknown models fall back to the flash rate.
export const MODEL_PRICING_USD_PER_MTOK: Record<string, { in: number; out: number }> = {
  "google/gemini-3-flash-preview": { in: 0.075, out: 0.3 },
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-sonnet-5": { in: 3, out: 15 },
  "claude-opus-4-8": { in: 15, out: 75 },
};

export const FIRECRAWL_USD_PER_OP = 0.0015;

const FLASH = "google/gemini-3-flash-preview";

export function priceForModel(model: string): { in: number; out: number } {
  // Try the id as-is, then without an "anthropic/" gateway prefix (section
  // models can resolve to e.g. "anthropic/claude-sonnet-5"), then flash.
  return (
    MODEL_PRICING_USD_PER_MTOK[model] ??
    MODEL_PRICING_USD_PER_MTOK[model.replace(/^anthropic\//, "")] ??
    MODEL_PRICING_USD_PER_MTOK[FLASH]
  );
}

export interface RunCost {
  est_total_usd: number;
  ai_calls: number;
  ai_input_tokens: number;
  ai_output_tokens: number;
  ai_usd: number;
  firecrawl_ops: number;
  firecrawl_usd: number;
  basis: string;
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Aggregate metered AI token usage + Firecrawl op count into an estimated USD
 * cost. Metered AI tokens are exact; Firecrawl is by op count; Perplexity
 * research calls are NOT metered and are excluded (noted in `basis`). Pure and
 * defensive — bad/negative inputs are floored to 0 so a telemetry glitch can
 * never make a run's cost negative or NaN.
 */
export function computeRunCost(aiUsage: AiUsageEntry[], firecrawlOps: number): RunCost {
  const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  let aiIn = 0;
  let aiOut = 0;
  let aiUsd = 0;
  for (const u of aiUsage ?? []) {
    const p = priceForModel(u.model);
    const inTok = safe(u.input);
    const outTok = safe(u.output);
    aiUsd += (inTok / 1_000_000) * p.in + (outTok / 1_000_000) * p.out;
    aiIn += inTok;
    aiOut += outTok;
  }
  const ops = safe(firecrawlOps);
  const firecrawlUsd = ops * FIRECRAWL_USD_PER_OP;
  return {
    est_total_usd: round4(aiUsd + firecrawlUsd),
    ai_calls: (aiUsage ?? []).length,
    ai_input_tokens: aiIn,
    ai_output_tokens: aiOut,
    ai_usd: round4(aiUsd),
    firecrawl_ops: ops,
    firecrawl_usd: round4(firecrawlUsd),
    basis:
      "estimated list prices (USD); AI tokens metered, Firecrawl by op count; excludes Perplexity research; internal ops visibility only",
  };
}
