/**
 * Citation integrity: renumber inline [N] markers to a contiguous 1..M that maps
 * exactly onto the rendered Sources list (Stage 7 bugs B11 + B15).
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / cardFields.ts.
 *
 * Why it exists: the AI cites claims with [N] where N indexes the FULL Perplexity
 * source list (up to ~50 URLs), but only a subset is ever cited — so a report's
 * body reads "[1]…[10]" then jumps to "[31], [33], [44]" while the footer shows
 * "Sources (50)". The indices look broken and most listed sources are never
 * referenced. This pass, run once before the report JSON is stored:
 *   1. collects the citation indices ACTUALLY used, in first-appearance order
 *      across the sections (in render order);
 *   2. remaps them to a contiguous 1..M;
 *   3. rewrites every [old] → [new] in the section prose;
 *   4. returns a Sources list of exactly those M cited sources, in the new order,
 *      so inline markers and the footer are 1:1 and the count reconciles (B15).
 *
 * Safety:
 *  - Out-of-range markers (a bracketed year like [2024], or a hallucinated index
 *    past the source list) are LEFT UNTOUCHED — never renumbered, never dropped.
 *  - Input is never mutated; changed sections are returned as copies.
 *  - No citations, or none actually used → returns the input unchanged (no-op),
 *    so a report that simply doesn't cite anything keeps its behaviour.
 */

const MARKER_RE = /\[(\d+)\]/g;

/**
 * Pseudo-citations: the model sometimes cites a labelled CONTEXT VARIABLE
 * instead of a numbered source — SWOT sections shipped literal "[Cost Data]" /
 * "[Cost of Business Data]" markers because the cost-of-business research is
 * injected as a named block with no [N] source of its own. These read as broken
 * citations in the report. The prompt now forbids them (numeric-only rule); this
 * strip is the safety net. Deliberately an explicit allowlist of known context
 * labels — a generic [text] pattern would eat markdown links and legitimate
 * bracketed prose.
 */
// [ ]? (space only, never \s) — \s would match a newline and merge two
// markdown lines when a pseudo-citation opens a line (QA audit W1).
const CONTEXT_LABEL_RE =
  /[ ]?\[(?:cost (?:of business )?data|cost of business|company profile|enriched company profile|market research(?: data)?|end buyer research)\]/gi;

/** Remove known context-label pseudo-citations from section prose. Pure. */
export function stripContextLabelCitations(
  sections: Record<string, { content?: string; [k: string]: unknown }>,
): Record<string, { content?: string; [k: string]: unknown }> {
  const out: Record<string, { content?: string; [k: string]: unknown }> = {};
  for (const [name, data] of Object.entries(sections)) {
    if (data && typeof data.content === "string" && CONTEXT_LABEL_RE.test(data.content)) {
      CONTEXT_LABEL_RE.lastIndex = 0;
      out[name] = { ...data, content: data.content.replace(CONTEXT_LABEL_RE, "") };
    } else {
      CONTEXT_LABEL_RE.lastIndex = 0;
      out[name] = data;
    }
  }
  return out;
}

export interface RenumberResult {
  sections: Record<string, { content?: string; [k: string]: unknown }>;
  citations: string[];
  /** Count of distinct sources kept (0 = no-op). */
  remapped: number;
}

/**
 * @param sections     section-name → { content, ... } map (content carries [N] markers)
 * @param sectionOrder render order of sections; drives first-appearance numbering
 * @param citations    the full 1-based source list ([N] refers to citations[N-1])
 */
export function renumberCitations(
  sections: Record<string, { content?: string; [k: string]: unknown }>,
  sectionOrder: string[],
  citations: string[],
): RenumberResult {
  const cites = Array.isArray(citations) ? citations : [];
  if (cites.length === 0) return { sections, citations: cites, remapped: 0 };

  // Iterate sections in render order first, then any stragglers not in the order,
  // so first-appearance numbering follows what the reader sees.
  const ordered = [
    ...sectionOrder.filter((n) => n in sections),
    ...Object.keys(sections).filter((n) => !sectionOrder.includes(n)),
  ];

  // 1. Collect used in-range indices in first-appearance order.
  const remap = new Map<number, number>(); // old (1-based) → new (1-based)
  let next = 1;
  for (const name of ordered) {
    const content = sections[name]?.content;
    if (typeof content !== "string") continue;
    const re = new RegExp(MARKER_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const old = parseInt(m[1], 10);
      if (old >= 1 && old <= cites.length && !remap.has(old)) remap.set(old, next++);
    }
  }
  if (remap.size === 0) return { sections, citations: cites, remapped: 0 };

  // 2. Rewrite markers in every section (copy — never mutate input). A single
  //    pass with a lookup avoids the double-rewrite hazard of sequential replaces.
  const outSections: Record<string, { content?: string; [k: string]: unknown }> = {};
  for (const [name, data] of Object.entries(sections)) {
    if (data && typeof data.content === "string") {
      outSections[name] = {
        ...data,
        content: data.content.replace(new RegExp(MARKER_RE.source, "g"), (full, n) => {
          const nw = remap.get(parseInt(n, 10));
          return nw ? `[${nw}]` : full; // out-of-range → unchanged
        }),
      };
    } else {
      outSections[name] = data;
    }
  }

  // 3. Sources list of exactly the cited sources, in new-number order.
  const newCitations: string[] = new Array(remap.size);
  for (const [old, nw] of remap) newCitations[nw - 1] = cites[old - 1];

  return { sections: outSections, citations: newCitations, remapped: remap.size };
}
