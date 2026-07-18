import type { MatchCard, Paragraph, RankedItem } from "@/types/report";
import Rich from "./Rich";

/** Ranked "our read" ruled rows: 2px ink top rule, sky 01, muted 02+. */
export const RankedRows = ({ items }: { items: RankedItem[] }) => (
  <div className="mb-9 flex flex-col">
    {items.map((item, i) => (
      <div
        key={i}
        className={`grid grid-cols-[32px_210px_1fr_130px] items-baseline gap-4 py-4 ${
          i === 0 ? "border-t-2 border-t-report-ink" : "border-t border-report-border"
        } last:border-b last:border-b-report-border`}
      >
        <span className={`text-[15px] font-bold ${i === 0 ? "text-report-action" : "text-report-muted"}`}>
          {String(item.rank).padStart(2, "0")}
        </span>
        <span>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener" className="text-inherit">
              <b className="text-[14px] font-bold">{item.name} ↗</b>
            </a>
          ) : (
            <b className="text-[14px] font-bold">{item.name}</b>
          )}
          <br />
          <span className="text-[10.5px] text-report-caption">{item.meta}</span>
        </span>
        <Rich as="span" text={item.why} className="text-[13px] leading-[1.65] text-report-ink-soft" />
        <span className="text-right text-[9.5px] font-bold uppercase text-report-action">{item.roleTag}</span>
      </div>
    ))}
  </div>
);

/** Numbered prose read (investor approach order — framed as ONE possible order). */
export const NumberedProse = ({ items }: { items: { label: string; text: Paragraph }[] }) => (
  <div className="mb-9 flex flex-col">
    {items.map((item, i) => (
      <div
        key={i}
        className={`grid grid-cols-[32px_1fr] gap-4 py-4 ${
          i === 0 ? "border-t-2 border-t-report-ink" : "border-t border-report-border"
        } last:border-b last:border-b-report-border`}
      >
        <span className={`text-[15px] font-bold ${i === 0 ? "text-report-action" : "text-report-muted"}`}>
          {i + 1}
        </span>
        <span className="text-[13px] leading-[1.7]">
          <b>{item.label}</b> — <Rich as="span" text={item.text} />
        </span>
      </div>
    ))}
  </div>
);

interface GridCard extends MatchCard {
  /** Optional extra caps line under the description (e.g. cheque size). */
  extraLine?: string;
}

/** Full match set — nothing the matcher surfaced is dropped (DECISIONS #3). */
export const MatchGrid = ({ header, cards, columns = 3 }: { header: string; cards: GridCard[]; columns?: 3 | 4 }) => (
  <>
    <p className="mb-3.5 text-[10px] font-bold tracking-[0.12em] text-report-muted">{header}</p>
    <div className={`grid gap-4 ${columns === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-report-border px-[22px] py-[18px]">
          <div className="flex justify-between gap-2">
            {card.url ? (
              <a href={card.url} target="_blank" rel="noopener" className="text-[13px] font-bold text-inherit">
                {card.name} ↗
              </a>
            ) : (
              <span className="text-[13px] font-bold">{card.name}</span>
            )}
            {card.tag && (
              <span className="whitespace-nowrap text-[8.5px] font-bold uppercase text-report-muted">{card.tag}</span>
            )}
          </div>
          <div className="mt-1.5 text-[11.5px] leading-[1.6] text-report-muted">{card.description}</div>
          {card.extraLine && (
            <div className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-report-caption">
              {card.extraLine}
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);
