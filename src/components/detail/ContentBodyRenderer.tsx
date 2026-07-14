import DOMPurify from "dompurify";
import parse, { Element as ParserElement } from "html-react-parser";
import { applyEnhancements } from "@/lib/case-study/applyEnhancements";
import { PullQuote } from "@/components/case-study/PullQuote";
import { YouTubeEmbed, extractYouTubeId } from "@/components/detail/YouTubeEmbed";
import type {
  CaseStudyQuote,
  CaseStudySource,
  LinkerEntry,
} from "@/lib/case-study/types";

// Force all links in user-rendered HTML to open in a new tab so embedded
// previews (which block iframing, e.g. YouTube) don't show a dead screen.
// Also detect bare YouTube links and convert them into embed placeholders
// (rendered as <YouTubeEmbed/> by the parser pass below).
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      const text = (node.textContent || "").trim();
      const ytId = extractYouTubeId(href);
      // Only auto-embed when the anchor is a bare URL (text === href), not an
      // inline contextual link inside a sentence.
      if (ytId && (text === href || text === "" || text === ytId)) {
        node.setAttribute("data-youtube-id", ytId);
        return;
      }
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
    // Normalise existing YouTube iframes to the privacy-enhanced host.
    if (node.tagName === "IFRAME") {
      const src = node.getAttribute("src") || "";
      const ytId = extractYouTubeId(src);
      if (ytId) {
        node.setAttribute("data-youtube-id", ytId);
      }
    }
  });
}

const SANITIZE_OPTS = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "frameborder",
    "data-youtube-id",
    "target",
    "rel",
  ],
};

const parserOptions = {
  replace: (node: unknown) => {
    if (node instanceof ParserElement) {
      const id = node.attribs?.["data-youtube-id"];
      if (id) return <YouTubeEmbed videoId={id} />;
    }
    return undefined;
  },
};

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
      });
    }
    return <>{parse(DOMPurify.sanitize(text, SANITIZE_OPTS), parserOptions)}</>;
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
