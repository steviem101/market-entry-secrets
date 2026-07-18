import { useReportInteractions, type ShortlistItem } from "./ReportInteractionsProvider";

/**
 * Shortlist star on a matched-entity card header (README interactions).
 * ☆ (idle) → ★ (starred, amber). The glyph is small but the button carries a
 * ≥24px tap target inline; ticket 15's mobile pass widens it to 44px. The
 * starred set collects as chips in §14.
 */
const StarToggle = ({ name, url, section }: ShortlistItem) => {
  const { isStarred, toggleStar } = useReportInteractions();
  const on = isStarred(url || name);
  return (
    <button
      type="button"
      aria-label={on ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      aria-pressed={on}
      onClick={() => toggleStar({ name, url, section })}
      className={`ml-1.5 inline-flex min-h-[24px] min-w-[24px] items-center justify-center align-[1px] text-[15px] leading-none ${
        on ? "text-report-warn-accent" : "text-report-dash"
      }`}
    >
      {on ? "★" : "☆"}
    </button>
  );
};

export default StarToggle;
