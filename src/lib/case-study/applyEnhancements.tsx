import type { ReactNode } from "react";
import DOMPurify from "dompurify";
import parse, { Element, Text } from "html-react-parser";
import type { DOMNode, HTMLReactParserOptions } from "html-react-parser";

import { autolinkText, type LinkToken } from "./autolink";
import { decodeApostrophes } from "./decodeApostrophes";
import { splitParagraph } from "./splitParagraphs";
import type { CaseStudySource, LinkerEntry } from "./types";

import { InlineCitation } from "@/components/case-study/InlineCitation";

interface ApplyEnhancementsOptions {
  corpus: LinkerEntry[];
  linkedNames: Set<string>;
  sources?: CaseStudySource[];
  subjectName?: string;
  subjectAliases?: string[];
  googleFallback?: boolean;
  maxWords?: number;
}

const CITATION_REGEX = /\[(\d+)\]/g;

interface SourceLookup {
  byNumber: Map<number, CaseStudySource>;
}

function buildSourceLookup(sources: CaseStudySource[] | undefined): SourceLookup {
  const byNumber = new Map<number, CaseStudySource>();
  (sources ?? []).forEach((s, i) => {
    const n = s.citation_number ?? i + 1;
    byNumber.set(n, s);
  });
  return { byNumber };
}

function tokensToReactNodes(tokens: LinkToken[], keyPrefix: string): ReactNode[] {
  return tokens.map((tok, i) => {
    if (tok.kind === "text") return tok.text;
    return (
      <a
        key={`${keyPrefix}-${i}`}
        href={tok.href}
        rel={tok.nofollow ? "nofollow noopener noreferrer" : undefined}
        target={tok.nofollow ? "_blank" : undefined}
        className="text-primary underline-offset-2 hover:underline"
      >
        {tok.text}
      </a>
    );
  });
}

function transformText(
  text: string,
  opts: ApplyEnhancementsOptions,
  lookup: SourceLookup,
  keyPrefix: string,
): ReactNode[] {
  if (!text) return [];

  const segments: { kind: "text" | "cite"; value: string; n?: number }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(CITATION_REGEX.source, "g");

  while ((match = re.exec(text)) !== null) {
    const n = Number(match[1]);
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: "cite", value: match[0], n });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  const out: ReactNode[] = [];
  segments.forEach((seg, i) => {
    const segKey = `${keyPrefix}-s${i}`;
    if (seg.kind === "cite" && seg.n !== undefined) {
      const src = lookup.byNumber.get(seg.n);
      if (src) {
        out.push(<InlineCitation key={segKey} number={seg.n} label={src.label} />);
        return;
      }
      out.push(seg.value);
      return;
    }
    const tokens = autolinkText(seg.value, {
      corpus: opts.corpus,
      linkedNames: opts.linkedNames,
      subjectName: opts.subjectName,
      subjectAliases: opts.subjectAliases,
      googleFallback: opts.googleFallback,
    });
    out.push(...tokensToReactNodes(tokens, segKey));
  });

  return out;
}

function getElementText(el: Element): string {
  let txt = "";
  for (const child of el.children as DOMNode[]) {
    if (child instanceof Text) {
      txt += child.data;
    } else if (child instanceof Element) {
      txt += getElementText(child);
    }
  }
  return txt;
}

function hasInlineTags(el: Element): boolean {
  return el.children.some((c) => c instanceof Element);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Render an HTML body with all readability enhancements applied.
 *
 * - Sanitises via DOMPurify
 * - Decodes doubled apostrophes (defence-in-depth for the Go1 bug)
 * - Splits long plain-text <p>s on sentence boundaries (>80 words default)
 *   NOTE: paragraphs containing inline tags (<strong>/<em>/<a>) are left as
 *   one paragraph to preserve formatting — this is a known Tier A limitation.
 * - Replaces [N] citation markers with <InlineCitation>
 * - Autolinks corpus matches and (optionally) Google fallbacks in text nodes
 */
export function applyEnhancements(
  rawHtml: string,
  opts: ApplyEnhancementsOptions,
): ReactNode {
  const safe = DOMPurify.sanitize(decodeApostrophes(rawHtml));
  const lookup = buildSourceLookup(opts.sources);
  const maxWords = opts.maxWords ?? 80;

  const parserOptions: HTMLReactParserOptions = {
    replace: (node) => {
      // Split long plain-text paragraphs into multiple <p>s.
      if (node instanceof Element && node.name === "p") {
        const fullText = getElementText(node);
        if (!hasInlineTags(node) && countWords(fullText) > maxWords) {
          const paragraphs = splitParagraph(fullText, maxWords);
          return (
            <>
              {paragraphs.map((p, i) => (
                <p key={`split-${i}`} className="mb-4 last:mb-0">
                  {transformText(p, opts, lookup, `split-${i}`)}
                </p>
              ))}
            </>
          );
        }
      }

      // Transform text nodes: apply autolink + citation replacement.
      if (node instanceof Text) {
        const transformed = transformText(
          String(node.data ?? ""),
          opts,
          lookup,
          "t",
        );
        return <>{transformed}</>;
      }

      // Other element types: let the parser walk into children with the
      // same callback (returns undefined => default behaviour).
      return undefined;
    },
  };

  return parse(safe, parserOptions);
}
