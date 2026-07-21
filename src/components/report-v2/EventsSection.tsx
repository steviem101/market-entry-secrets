import type { Report } from "@/types/report";
import { formatReportDate, formatEventWindow } from "@/lib/report-v2/format";
import SectionCard from "./SectionCard";
import StarToggle from "./StarToggle";
import Rich from "./Rich";

/**
 * §09 events: date-led cards (amber mono date + venue, why-this-room body),
 * an optional "also flagged" line, and an optional "maximise these rooms"
 * tips block (lemlist fixture) rendered as a tinted callout. Cards arrive
 * date-sorted from the adapter; the header shows the real month window instead
 * of a hardcoded (and routinely false) "this quarter".
 */
const EventsSection = ({ report }: { report: Report }) => {
  const { events } = report;
  const dated = events.cards.filter((e) => e.date);
  const dateWindow = dated.length
    ? formatEventWindow(dated[0].date, dated[dated.length - 1].date)
    : "";
  return (
    <SectionCard label="EVENTS — HIGH-SIGNAL ROOMS" className="pb-10">
      {dateWindow && (
        <p className="mb-1 mt-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-report-caption">
          {dateWindow}
        </p>
      )}
      {/* flex-wrap (not a fixed 3-col grid): with a single matched event the
          grid left two empty columns; here the card grows to fill the row, and
          2–3 events still lay out as halves/thirds (basis-[300px]). */}
      <div className="mt-2 flex flex-col gap-[22px] md:flex-row md:flex-wrap">
        {events.cards.map((event, i) => (
          <div key={event.url || event.name || i} className="rounded-xl border border-report-border px-[30px] py-7 md:grow md:basis-[300px]">
            <div className="text-[11px] font-bold uppercase text-report-warn">
              {[formatReportDate(event.date, "short"), event.venue].filter(Boolean).join(" · ")}
            </div>
            <div className="my-2.5 text-[15px] font-bold leading-[1.4]">
              {event.url ? (
                <a href={event.url} target="_blank" rel="noopener" className="text-inherit hover:underline">
                  {event.name} ↗
                </a>
              ) : (
                event.name
              )}
              <StarToggle name={event.name} url={event.url} section="Event" />
            </div>
            {event.why && (
              <Rich text={event.why} className="text-[13.5px] leading-[1.7] text-report-ink-soft" />
            )}
          </div>
        ))}
      </div>

      {events.alsoFlagged && (
        <Rich
          text={events.alsoFlagged}
          className="mt-[18px] text-[12.5px] leading-[1.7] text-report-muted"
        />
      )}

      {events.maximise && events.maximise.length > 0 && (
        <div className="mt-[22px] rounded-xl border border-report-tint-border bg-report-tint px-7 py-6">
          <p className="mb-3 text-[11px] font-bold tracking-[0.12em] text-report-action">
            MAXIMISE THESE ROOMS
          </p>
          <div className="flex flex-col gap-2.5 text-[13.5px] leading-[1.7] text-report-ink-soft">
            {events.maximise.map((tip, i) => (
              <div key={i}>
                <b>{tip.lead}</b> — <Rich as="span" text={tip.text} />
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default EventsSection;
