import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/common/SectionHeading";
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
          <SectionHeading
            className="max-w-2xl"
            kicker="03 / Case studies"
            title={`${countryName} founders who landed Australia`}
            subhead={`${caseStudies.length} companies, ${caseStudies.length} different shapes of entry. Filter by sector to see who looks like you.`}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={scrollPrev}
              aria-label="Previous case study"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={scrollNext}
              aria-label="Next case study"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {sectors.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === activeSector}
              onClick={() => setActiveSector(s)}
              className={cn(
                badgeVariants({ variant: s === activeSector ? "default" : "outline" }),
                "cursor-pointer uppercase tracking-wider px-3 py-1.5",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {filtered.map((c) => {
              const body = (
                <>
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
                </>
              );
              const cardClass =
                "flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_40%] lg:flex-[0_0_32%] bg-mes-card border border-mes-border rounded-xl p-5 flex flex-col";

              // Whole card is the click target when a written playbook exists;
              // companies without one render as plain cards by design.
              return c.content_item_slug ? (
                <Link
                  key={c.id}
                  to={`/case-studies/${c.content_item_slug}`}
                  className={`${cardClass} group transition-all duration-200 hover:border-mes-ink hover:shadow-md`}
                >
                  {body}
                  <span className="mt-auto pt-5 inline-flex items-center text-[14px] font-medium text-mes-teal-dark group-hover:text-mes-ink">
                    Read the {c.company_name} playbook
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ) : (
                <article key={c.id} className={cardClass}>
                  {body}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
