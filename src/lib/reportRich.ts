import type { Chip } from "@/types/report";

/**
 * Tokenizer for the report_v2 Paragraph grammar (contracts.md):
 * EXACTLY three constructs — **bold**, [text](/path) entity links, and
 * {chip:sourced|est|inferred} inline evidence chips. Everything else is
 * plain text (React escapes it on render). Single regex pass.
 */
export type RichToken =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; url: string }
  | { type: "chip"; chip: Chip };

const TOKEN_RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|\{chip:(sourced|est|inferred)\}/g;

export function tokenizeParagraph(paragraph: string): RichToken[] {
  const tokens: RichToken[] = [];
  let last = 0;
  for (const m of paragraph.matchAll(TOKEN_RE)) {
    const index = m.index ?? 0;
    if (index > last) tokens.push({ type: "text", text: paragraph.slice(last, index) });
    if (m[1] !== undefined) tokens.push({ type: "bold", text: m[1] });
    else if (m[2] !== undefined) tokens.push({ type: "link", text: m[2], url: m[3] });
    else tokens.push({ type: "chip", chip: m[4] as Chip });
    last = index + m[0].length;
  }
  if (last < paragraph.length) tokens.push({ type: "text", text: paragraph.slice(last) });
  return tokens;
}
