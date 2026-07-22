/**
 * B2 (Floats smoke test) — a short orientation card after the cover. Tells the
 * reader the report is interactive, that what they star/request is seen by their
 * advisor and shapes the session, and that this is the starting map (the advisor
 * agrees next steps once they've digested it). Also restates the evidence-marker
 * legend. Web-only (`print:hidden`) — the interactivity it describes is web, and
 * the printed PDF is a static artifact.
 */
const HowToReadCard = () => (
  <section className="rounded-[14px] border border-report-tint-border bg-report-tint px-5 py-7 text-report-ink lg:px-12 print:hidden">
    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-report-action">
      How to read this report
    </p>
    <div className="grid gap-6 md:grid-cols-3">
      <div>
        <p className="mb-1.5 text-[13.5px] font-bold">It's interactive</p>
        <p className="text-[13px] leading-[1.65] text-report-ink-soft">
          Star (♥) the providers, mentors and investors that fit, and use the request boxes.
          Your shortlist and requests are saved to this report.
        </p>
      </div>
      <div>
        <p className="mb-1.5 text-[13.5px] font-bold">Your advisor sees it</p>
        <p className="text-[13px] leading-[1.65] text-report-ink-soft">
          What you star and request shapes your advisory session — we arrive prepared on exactly
          what you flagged, instead of spending the call re-deciding.
        </p>
      </div>
      <div>
        <p className="mb-1.5 text-[13.5px] font-bold">It's the starting map</p>
        <p className="text-[13px] leading-[1.65] text-report-ink-soft">
          This report opens the conversation. Your advisor walks the route with you and agrees the
          next steps once you've digested it.
        </p>
      </div>
    </div>
    <p className="mt-5 border-t border-report-tint-border pt-4 text-[12.5px] leading-[1.7] text-report-muted">
      Evidence markers you'll see on figures: <b className="text-report-sky">●</b> sourced ·{" "}
      <b className="text-report-warn">◐</b> estimated · <b className="text-report-caption">○</b> inferred
      — so you can weigh every number at a glance.
    </p>
  </section>
);

export default HowToReadCard;
