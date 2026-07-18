import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportInteractions, type ShortlistItem } from "./ReportInteractionsProvider";

/**
 * Shortlist bookmark on a matched-entity card header (README interactions),
 * using the same heart affordance as the app's directory-card bookmarks
 * (lucide Heart, red + filled when saved). ≥44px tap target on mobile
 * (MOBILE_AND_PDF.md), tightened inline on desktop. The saved set collects
 * as chips in §14.
 */
const StarToggle = ({ name, url, section }: ShortlistItem) => {
  const { isStarred, toggleStar } = useReportInteractions();
  const saved = isStarred(url || name);
  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      aria-pressed={saved}
      onClick={() => toggleStar({ name, url, section })}
      className="ml-1 inline-flex h-11 w-11 -my-3 items-center justify-center align-middle md:my-0 md:h-6 md:w-6"
    >
      <Heart
        className={cn(
          "h-[15px] w-[15px] text-report-dash transition-colors",
          saved && "fill-current text-red-500"
        )}
      />
    </button>
  );
};

export default StarToggle;
