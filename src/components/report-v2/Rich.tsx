import { tokenizeParagraph } from "@/lib/reportRich";
import { isPlatformPath } from "@/lib/report-v2/format";
import type { Paragraph } from "@/types/report";
import EvidenceChip from "./EvidenceChip";
import { cn } from "@/lib/utils";

interface RichProps {
  text: Paragraph;
  className?: string;
  /** Wrapping element; defaults to <p>. */
  as?: "p" | "span" | "div";
}

/**
 * Shared renderer for the Paragraph markdown-lite grammar (contracts.md):
 * **bold** → <strong>, [text](/path) → entity link (new tab, path comes
 * pre-resolved from the adapter — components never construct URLs), and
 * {chip:…} → inline EvidenceChip. Everything else renders as escaped text.
 */
const Rich = ({ text, className, as: Tag = "p" }: RichProps) => (
  <Tag className={cn(className)}>
    {tokenizeParagraph(text).map((token, i) => {
      switch (token.type) {
        case "bold":
          return (
            <strong key={i} className="font-bold">
              {token.text}
            </strong>
          );
        case "link":
          // Defense in depth: links embedded in LLM section prose never pass
          // through the adapter's URL sanitizer, so a non-platform-relative
          // href (javascript:, external, protocol-relative) is neutralised to
          // plain text here rather than rendered as a live anchor.
          return isPlatformPath(token.url) ? (
            <a
              key={i}
              href={token.url}
              target="_blank"
              rel="noopener"
              className="text-report-action hover:underline"
            >
              {token.text}
            </a>
          ) : (
            <span key={i}>{token.text}</span>
          );
        case "chip":
          return <EvidenceChip key={i} chip={token.chip} />;
        default:
          return token.text;
      }
    })}
  </Tag>
);

export default Rich;
