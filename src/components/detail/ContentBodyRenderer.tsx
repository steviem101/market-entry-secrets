import DOMPurify from "dompurify";

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
}

export const ContentBodyRenderer = ({
  generalContent,
  groupedContent,
  questionStyle = "heading",
}: ContentBodyRendererProps) => {
  return (
    <>
      {/* General Content (not in sections) */}
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
              <div
                className="text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body.body_text) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sectioned Content */}
      <div className="prose prose-lg max-w-none">
        {groupedContent.map((section) => (
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
                <div
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body.body_text) }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
