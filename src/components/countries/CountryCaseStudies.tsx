import { useCallback, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CountryCaseStudy } from "@/lib/countryPageContent";

interface CountryCaseStudiesProps {
  countryName: string;
  caseStudies: CountryCaseStudy[];
}

export const CountryCaseStudies = ({ countryName, caseStudies }: CountryCaseStudiesProps) => {
  const [activeSector, setActiveSector] = useState<string>("All");
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", dragFree: true });

  const sectors = useMemo(() => {
    const s = Array.from(new Set(caseStudies.map((c) => c.sector)));
    return ["All", ...s];
  }, [caseStudies]);

  const filtered = useMemo(
    () => (activeSector === "All" ? caseStudies : caseStudies.filter((c) => c.sector === activeSector)),
    [activeSector, caseStudies],
  );

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  if (!caseStudies?.length) return null;

  return (
    <section id="case-studies" className="border-b border-mes-border bg-mes-bg">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
              03 / Case studies
            </div>
            <h2 className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold text-mes-ink">
              {countryName} founders who landed Australia
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-mes-ink-soft">
              Eleven companies, eleven different shapes of entry. Filter by sector to see who looks like you.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous case study"
              className="w-10 h-10 rounded-full border border-mes-border bg-mes-card hover:border-mes-ink flex items-center justify-center text-mes-ink-soft hover:text-mes-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next case study"
              className="w-10 h-10 rounded-full border border-mes-border bg-mes-card hover:border-mes-ink flex items-center justify-center text-mes-ink-soft hover:text-mes-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {sectors.map((s) => {
            const active = s === activeSector;
            return (
              <button
                key={s}
                onClick={() => setActiveSector(s)}
                className={`text-[12px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-mes-ink text-white border-mes-ink"
                    : "bg-mes-card text-mes-ink-soft border-mes-border hover:border-mes-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_40%] lg:flex-[0_0_32%] bg-mes-card border border-mes-border rounded-xl p-5"
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-semibold tracking-wider"
                  style={{ background: c.logo_color ?? "hsl(var(--mes-ink))" }}
                  aria-hidden
                >
                  {c.wordmark || c.company_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-[18px] font-semibold text-mes-ink">{c.company_name}</h3>
                  <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-mes-blue-light bg-mes-blue-light/40 text-mes-teal-dark">
                    {c.sector}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-mes-ink-soft">{c.outcome}</p>
                <div className="mt-5">
                  <Button asChild variant="link" className="p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
                    <a href={c.content_item_id ? `/case-studies/${c.id}` : "#case-studies"}>
                      Read the {c.company_name} playbook
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
