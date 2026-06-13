import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventLike {
  id: string;
  title?: string | null;
  date?: string | null;
  location?: string | null;
  description?: string | null;
  category?: string | null;
  slug?: string | null;
}

interface CountryEventsProps {
  countryName: string;
  events: EventLike[];
}

const formatDay = (iso?: string | null) => {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 2);
  return String(d.getDate()).padStart(2, "0");
};

const formatMonthYear = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleString("en-AU", { month: "short", year: "numeric" })
    .toUpperCase();
};

export const CountryEvents = ({ countryName, events }: CountryEventsProps) => {
  if (!events?.length) return null;

  return (
    <section className="border-b border-mes-border bg-mes-bg">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
            07 / Events
          </div>
          <h2 className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold text-mes-ink">
            Where {countryName} founders show up in Australia
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-mes-ink-soft">
            Trade missions, chamber dinners, sector forums. Curated, not the firehose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.slice(0, 8).map((e) => (
            <article
              key={e.id}
              className="bg-mes-card border border-mes-border rounded-xl p-5 flex flex-col"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[36px] font-semibold tabular-nums leading-none text-mes-ink">
                  {formatDay(e.date)}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-mes-ink-muted">
                  {formatMonthYear(e.date)}
                </span>
              </div>
              {e.location && (
                <div className="mt-3 text-[12px] uppercase tracking-wider text-mes-ink-muted">
                  {e.location}
                </div>
              )}
              <h3 className="mt-2 text-[15.5px] font-semibold text-mes-ink leading-snug">
                {e.title}
              </h3>
              {e.description && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-mes-ink-soft line-clamp-3">
                  {e.description}
                </p>
              )}
              <div className="mt-auto pt-4">
                <Button asChild variant="link" className="p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
                  <a href={e.slug ? `/events/${e.slug}` : "/events"}>
                    Event details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
