import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

interface CityLike {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  hero_description?: string | null;
  key_industries?: string[] | null;
}

interface CountryCitiesProps {
  cities: CityLike[];
}

export const CountryCities = ({ cities }: CountryCitiesProps) => {
  if (!cities?.length) return null;
  return (
    <section className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <SectionHeading
          className="mb-10"
          kicker="08 / Cities"
          title="Which Australian city to land in"
          subhead={`${cities.length} landing pads. Each plays a different role in an ANZ entry.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((c) => (
            <article key={c.id} className="bg-mes-bg border border-mes-border rounded-xl overflow-hidden flex flex-col">
              <div
                aria-hidden
                className="h-20 w-full"
                style={{
                  background:
                    "repeating-linear-gradient(135deg, hsl(var(--mes-teal)) 0 12px, hsl(var(--mes-teal-dark)) 12px 24px)",
                }}
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-[18px] font-semibold text-mes-ink">{c.name}</h3>
                {c.hero_description && (
                  <p className="mt-2 text-[13.5px] leading-relaxed text-mes-ink-soft line-clamp-4">
                    {c.hero_description}
                  </p>
                )}
                {c.key_industries && c.key_industries.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.key_industries.slice(0, 3).map((ind) => (
                      <li
                        key={ind}
                        className="text-[11px] text-mes-ink-soft border border-mes-border rounded-full px-2 py-0.5"
                      >
                        {ind}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-4">
                  <Link
                    to={`/locations/${c.slug}`}
                    className="inline-flex items-center text-[13.5px] font-medium text-mes-teal-dark hover:text-mes-ink"
                  >
                    See {c.name} partners
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
