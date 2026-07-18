import type { Report } from "@/types/report";
import { formatReportDate } from "@/lib/report-v2/format";
import SectionCard from "./SectionCard";
import Rich from "./Rich";

/**
 * §09 events: date-led cards (amber mono date + venue, why-this-room body),
 * an optional "also flagged" line, and an optional "maximise these rooms"
 * tips block (lemlist fixture) rendered as a tinted callout.
 */
const EventsSection = ({ report }: { report: Report }) => {
  const { events } = report;
  return (
    <SectionCard label="09 · EVENTS — HIGH-SIGNAL ROOMS THIS QUARTER" className="pb-[60px]">
      <div className="mt-2 grid grid-cols-3 gap-[22px]">
        {events.cards.map((event, i) => (
          <div key={event.url || event.name || i} className="rounded-xl border border-report-border px-[30px] py-7">
            <div className="text-[10px] font-bold uppercase text-report-warn">
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
            </div>
            <Rich text={event.why} className="text-[12.5px] leading-[1.7] text-report-ink-soft" />
          </div>
        ))}
      </div>

      {events.alsoFlagged && (
        <Rich
          text={events.alsoFlagged}
          className="mt-[18px] text-[12px] leading-[1.7] text-report-muted"
        />
      )}

      {events.maximise && events.maximise.length > 0 && (
        <div className="mt-[22px] rounded-xl border border-report-tint-border bg-report-tint px-7 py-6">
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-report-action">
            MAXIMISE THESE ROOMS
          </p>
          <div className="flex flex-col gap-2.5 text-[12.5px] leading-[1.7] text-report-ink-soft">
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
