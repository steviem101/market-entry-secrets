import DOMPurify from "dompurify";
import { applyEnhancements } from "@/lib/case-study/applyEnhancements";
import { PullQuote } from "@/components/case-study/PullQuote";
import type {
  CaseStudyQuote,
  CaseStudySource,
  LinkerEntry,
} from "@/lib/case-study/types";

interface ContentBody {
  id: string;
  section_id?: string | null;
  question?: string | null;
  body_text: string;
}

interface GroupedSection {
  id: string;
  slug: string;
  title: string;
  bodies: ContentBody[];
}

interface ContentBodyRendererProps {
  generalContent: ContentBody[];
  groupedContent: GroupedSection[];
  /** Style variant for question display */
  questionStyle?: "box" | "heading";
  /** When defined, enables case-study readability enhancements. */
  linkerCorpus?: LinkerEntry[];
  sources?: CaseStudySource[];
  quotes?: CaseStudyQuote[];
  subjectName?: string;
  subjectAliases?: string[];
  googleFallback?: boolean;
}

export const ContentBodyRenderer = ({
  generalContent,
  groupedContent,
  questionStyle = "heading",
  linkerCorpus,
  sources,
  quotes,
  subjectName,
  subjectAliases,
  googleFallback,
}: ContentBodyRendererProps) => {
  const enhanced = linkerCorpus !== undefined;
  // Shared "first match per page wins" set across all bodies in this render.
  const linkedNames = new Set<string>();

  const renderBody = (text: string) => {
    if (enhanced) {
      return applyEnhancements(text, {
        corpus: linkerCorpus ?? [],
        linkedNames,
        sources,
        subjectName,
        subjectAliases,
        googleFallback,
      });
    }
    return (
      <span
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }}
      />
    );
  };

  // Group quotes by section_id for injection after each section's bodies.
  const quotesBySection = new Map<string, CaseStudyQuote[]>();
  (quotes ?? []).forEach((q) => {
    const key = q.section_id ?? "__general__";
    const list = quotesBySection.get(key) ?? [];
    list.push(q);
    quotesBySection.set(key, list);
  });

  return (
    <>
      {generalContent.length > 0 && (
        <div className="prose prose-lg max-w-none mb-12">
          {generalContent.map((body) => (
            <div key={body.id} className="mb-8">
              {body.question && (
                questionStyle === "box" ? (
                  <div className="bg-muted/50 border-l-4 border-primary rounded-r-lg p-4 mb-4">
                    <h2 className="text-xl font-semibold text-foreground m-0">
                      {body.question}
                    </h2>
                  </div>
                ) : (
                  <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">
                    {body.question}
                  </h3>
                )
              )}
              <div className="text-muted-foreground leading-relaxed">
                {renderBody(body.body_text)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {groupedContent.map((section) => {
          const sectionQuotes = quotesBySection.get(section.id) ?? [];
          return (
            <div key={section.id} id={section.slug} className="mb-14 scroll-mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">
                {section.title}
              </h2>

              {section.bodies.map((body) => (
                <div key={body.id} className="mb-6">
                  {body.question && (
                    questionStyle === "box" ? (
                      <div className="bg-muted/50 border-l-4 border-primary rounded-r-lg p-4 mb-4 not-prose">
                        <h3 className="text-lg font-semibold text-foreground m-0">
                          {body.question}
                        </h3>
                      </div>
                    ) : (
                      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                        {body.question}
                      </h3>
                    )
                  )}
                  <div className="text-muted-foreground leading-relaxed">
                    {renderBody(body.body_text)}
                  </div>
                </div>
              ))}

              {sectionQuotes
                .sort((a, b) => a.display_order - b.display_order)
                .map((q) => (
                  <PullQuote key={q.id} quote={q} />
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
};
