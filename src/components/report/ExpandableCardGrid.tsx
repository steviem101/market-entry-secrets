import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Long match grids (a Scale report can carry 10 providers) dominated the page:
// show the top-ranked cards and fold the rest behind an explicit toggle. The
// matcher returns items ranked best-first, so the visible slice is the best
// slate, not a random one. Collapsed cards stay `print:block` — the exported
// PDF always contains every match regardless of on-screen state.
const VISIBLE_WHEN_COLLAPSED = 4;
// Don't collapse marginal grids — "Show 1 more" is worse than showing it.
const COLLAPSE_WHEN_MORE_THAN = 6;

interface ExpandableCardGridProps {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  /** Plural noun for the toggle label, e.g. "providers", "investors". */
  label?: string;
}

export const ExpandableCardGrid = ({ items, renderItem, label = 'matches' }: ExpandableCardGridProps) => {
  const [expanded, setExpanded] = useState(false);
  const collapsible = items.length > COLLAPSE_WHEN_MORE_THAN;
  const folded = collapsible && !expanded;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, idx) => (
          <div
            key={item?.id || item?.name || idx}
            className={folded && idx >= VISIBLE_WHEN_COLLAPSED ? 'hidden print:block' : undefined}
          >
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 w-full gap-1.5 text-muted-foreground print:hidden"
        >
          {expanded ? (
            <>
              Show top {VISIBLE_WHEN_COLLAPSED} <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show all {items.length} {label} <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
