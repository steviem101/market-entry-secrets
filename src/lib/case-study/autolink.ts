import type { LinkerEntry } from "./types";

/**
 * Apply autolinks to a text string.
 *
 * Rules (Phase 2 plan, section 2.3):
 *   1. First match per page wins (use `linkedNames` set across calls).
 *   2. Word-boundary match on the entry name.
 *   3. Case-sensitive (avoids "Pitt" matching "Brad Pitt", etc.).
 *   4. Skip `subjectName` so a case study doesn't link itself.
 *
 * Returns an array of plain text and link tokens. Caller (applyEnhancements)
 * maps tokens to React nodes.
 */

export type LinkToken =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; nofollow: boolean; type: LinkerEntry["type"] };

export interface AutolinkOptions {
  corpus: LinkerEntry[];
  linkedNames: Set<string>;
  subjectName?: string;
  subjectAliases?: string[];
}

function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isSubject(name: string, opts: AutolinkOptions): boolean {
  if (opts.subjectName && name === opts.subjectName) return true;
  if (opts.subjectAliases?.includes(name)) return true;
  return false;
}

/**
 * Sort corpus by name length descending so multi-word names ("Amazon Web
 * Services") match before single tokens ("Amazon").
 */
export function sortCorpus(corpus: LinkerEntry[]): LinkerEntry[] {
  return [...corpus].sort((a, b) => b.name.length - a.name.length);
}

/**
 * Tokenise a single text string against the corpus.
 *
 * Strategy: walk all corpus entries (longest first), and for each, try to find
 * its first un-tokenised match. Replace that span with a link token. Repeat
 * for the rest of the corpus.
 */
export function autolinkText(text: string, opts: AutolinkOptions): LinkToken[] {
  if (!text) return [{ kind: "text", text }];
  let tokens: LinkToken[] = [{ kind: "text", text }];

  const sorted = sortCorpus(opts.corpus);

  for (const entry of sorted) {
    if (opts.linkedNames.has(entry.name.toLowerCase())) continue;
    if (isSubject(entry.name, opts)) continue;

    const re = new RegExp(`(?<![\\w])${escapeRegex(entry.name)}(?![\\w])`);
    const next: LinkToken[] = [];
    let matched = false;

    for (const tok of tokens) {
      if (matched || tok.kind !== "text") {
        next.push(tok);
        continue;
      }
      const m = tok.text.match(re);
      if (!m || m.index === undefined) {
        next.push(tok);
        continue;
      }
      const before = tok.text.slice(0, m.index);
      const matchText = tok.text.slice(m.index, m.index + m[0].length);
      const after = tok.text.slice(m.index + m[0].length);
      if (before) next.push({ kind: "text", text: before });
      next.push({
        kind: "link",
        text: matchText,
        href: entry.href,
        nofollow: !!entry.fallback,
        type: entry.type,
      });
      if (after) next.push({ kind: "text", text: after });
      opts.linkedNames.add(entry.name.toLowerCase());
      matched = true;
    }
    tokens = next;
  }

  return tokens;
}
