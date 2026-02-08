import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    const el = document.getElementById(`source-${number}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight via hash
      window.history.replaceState(null, '', `#source-${number}`);
      // Trigger :target styles
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
