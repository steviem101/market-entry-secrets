import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { emitCitationClick } from '@/lib/reportCitationBus';

interface InlineCitationProps {
  number: number;
  url: string;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const InlineCitation = ({ number, url }: InlineCitationProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ask the Sources list to open first — it's a collapsible that starts
    // closed, so the #source-N anchor is unmounted until it expands. The list
    // performs the scroll + highlight once its content has mounted (B11). Fall
    // back to a direct scroll for the case where it's already open.
    emitCitationClick(number);
    const el = document.getElementById(`source-${number}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.history.replaceState(null, '', `#source-${number}`);
      el.classList.add('citation-highlight');
      setTimeout(() => el.classList.remove('citation-highlight'), 2000);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={`#source-${number}`}
            onClick={handleClick}
            className="inline-citation no-print-url"
            aria-label={`Source ${number}`}
          >
            {number}
          </a>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <span className="text-muted-foreground">Source {number}:</span>{' '}
          <span className="text-primary">{extractDomain(url)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
