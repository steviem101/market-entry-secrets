import { ExternalLink } from "lucide-react";
import type { CaseStudySource } from "@/lib/case-study/types";

interface SourcesSectionProps {
  sources: CaseStudySource[] | null | undefined;
  className?: string;
}

export const SourcesSection = ({
  sources,
  className = "",
}: SourcesSectionProps) => {
  if (!sources || sources.length === 0) return null;

  const sorted = [...sources].sort((a, b) => {
    const an = a.citation_number ?? Number.MAX_SAFE_INTEGER;
    const bn = b.citation_number ?? Number.MAX_SAFE_INTEGER;
    return an - bn;
  });

  return (
    <section
      id="sources"
      aria-labelledby="sources-heading"
      className={`mt-12 pt-6 border-t border-border ${className}`}
    >
      <h2
        id="sources-heading"
        className="text-lg font-semibold text-foreground mb-4"
      >
        Sources
      </h2>
      <ol className="space-y-2 text-sm">
        {sorted.map((src, i) => {
          const n = src.citation_number ?? i + 1;
          return (
            <li
              key={src.id}
              id={`cite-${n}`}
              className="grid grid-cols-[auto_1fr] gap-2 items-baseline scroll-mt-24"
            >
              <span className="text-muted-foreground tabular-nums">[{n}]</span>
              <span className="min-w-0">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-words inline-flex items-baseline gap-1"
                >
                  {src.label}
                  <ExternalLink className="h-3 w-3 self-center flex-shrink-0" aria-hidden />
                </a>
                {src.accessed_at && (
                  <span className="text-muted-foreground ml-2">
                    · accessed {new Date(src.accessed_at).toLocaleDateString("en-AU", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
