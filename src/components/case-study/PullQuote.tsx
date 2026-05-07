import { Quote } from "lucide-react";
import type { CaseStudyQuote } from "@/lib/case-study/types";

interface PullQuoteProps {
  quote: CaseStudyQuote;
  className?: string;
}

export const PullQuote = ({ quote, className = "" }: PullQuoteProps) => {
  if (!quote?.quote?.trim()) return null;

  return (
    <figure
      className={`my-6 border-l-4 border-primary bg-primary/5 rounded-r-lg p-5 not-prose ${className}`}
    >
      <Quote className="h-5 w-5 text-primary mb-2 opacity-70" aria-hidden />
      <blockquote className="text-base sm:text-lg italic text-foreground leading-relaxed mb-3">
        “{quote.quote}”
      </blockquote>
      <figcaption className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground not-italic">
          {quote.attributed_to}
        </span>
        {quote.role && <span className="not-italic"> · {quote.role}</span>}
        {quote.source_url && (
          <>
            {" "}
            ·{" "}
            <a
              href={quote.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline not-italic"
            >
              {quote.source_label || "source"}
            </a>
          </>
        )}
      </figcaption>
    </figure>
  );
};
