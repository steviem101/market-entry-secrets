import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Briefcase } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { MARKET_ENTRY_QUESTIONS } from "@/data/marketEntryQuestions";

const PAGE_TITLE =
  "The 10 questions every company asks before entering Australia";
const META_DESCRIPTION =
  "Straight answers to the ten questions we hear most often about entering the Australian and New Zealand market — strategy, cost, regulation, timelines and localisation.";

const MarketEntryQuestions = () => {
  const faqJsonLd = {
    type: "FAQPage" as const,
    data: {
      mainEntity: MARKET_ENTRY_QUESTIONS.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
    },
  };

  return (
    <>
      <SEOHead
        title={`${PAGE_TITLE} | Market Entry Secrets`}
        description={META_DESCRIPTION}
        canonicalPath="/market-entry-questions"
        ogType="website"
        jsonLd={faqJsonLd}
      />

      <div className="container mx-auto px-4 py-10 lg:py-16">
        {/* Hero */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Market entry Q&amp;A
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {META_DESCRIPTION}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/report-creator">
              <Button size="lg" className="gap-2">
                Get your own market entry report
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" variant="outline">
                Browse the full FAQ
              </Button>
            </Link>
          </div>
        </header>

        {/* Question grid */}
        <section aria-labelledby="questions-heading" className="max-w-4xl mx-auto">
          <h2 id="questions-heading" className="sr-only">
            The ten most common market entry questions
          </h2>
          <ol className="grid gap-4 md:grid-cols-2">
            {MARKET_ENTRY_QUESTIONS.map((q, i) => (
              <li key={q.slug}>
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="text-xs font-semibold text-primary mb-2">
                      Question {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold leading-snug mb-2">
                      <Link
                        to={`/content/${q.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {q.question}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {q.teaser}
                    </p>
                    <Link
                      to={`/content/${q.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Read full guide
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* Secondary CTA */}
        <section className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Get answers tailored to your company
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                A general Q&amp;A only takes you so far. Our AI report generator
                pulls live market data, matched service providers and mentors,
                and builds a step-by-step ANZ market entry plan for your exact
                company, sector and stage.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/report-creator">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate your report
                  </Button>
                </Link>
                <Link to="/service-providers">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Briefcase className="w-4 h-4" />
                    Find a service provider
                  </Button>
                </Link>
                <Link to="/mentors">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    Talk to a mentor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default MarketEntryQuestions;