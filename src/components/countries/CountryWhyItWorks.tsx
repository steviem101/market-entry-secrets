import type { NarrativeBullet, DifferentiatorBullet } from "@/lib/countryPageContent";

interface CountryWhyItWorksProps {
  countryName: string;
  bullets: NarrativeBullet[];
  differentiators: DifferentiatorBullet[];
  pullQuote?: string | null;
  pullQuoteAttr?: string | null;
}

export const CountryWhyItWorks = ({
  countryName,
  bullets,
  differentiators,
  pullQuote,
  pullQuoteAttr,
}: CountryWhyItWorksProps) => {
  if (!bullets?.length) return null;

  return (
    <section className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
            02 / Why it works
          </div>
          <h2
            className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold text-mes-ink"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Australia is the most underrated second market for {countryName} founders.
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-mes-ink-soft max-w-2xl">
            Common law, English-speaking, fast procurement, and a dense Irish diaspora. Here is why {countryName} maps onto ANZ better than the UK or US do.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 md:gap-12">
          <ol className="md:col-span-7 space-y-6">
            {bullets.map((b, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                <div className="text-[12px] text-mes-ink-muted pt-1 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-mes-ink">{b.h}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-mes-ink-soft">{b.b}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="md:col-span-5">
            <div className="md:sticky md:top-32 space-y-6">
              {pullQuote && (
                <figure className="bg-mes-ink text-white rounded-xl p-6">
                  <blockquote className="text-[18px] leading-snug font-semibold">
                    &ldquo;{pullQuote}&rdquo;
                  </blockquote>
                  {pullQuoteAttr && (
                    <figcaption className="mt-4 text-[12px] uppercase tracking-wider text-white/60">
                      {pullQuoteAttr}
                    </figcaption>
                  )}
                </figure>
              )}

              {differentiators?.length > 0 && (
                <div className="bg-mes-bg border border-mes-border rounded-xl p-6">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark mb-4">
                    What is different vs US / UK
                  </div>
                  <ul className="space-y-4">
                    {differentiators.map((d, i) => (
                      <li key={i}>
                        <h4 className="text-[14px] font-semibold text-mes-ink">{d.h}</h4>
                        <p className="text-[13.5px] leading-relaxed text-mes-ink-soft mt-1">{d.b}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
