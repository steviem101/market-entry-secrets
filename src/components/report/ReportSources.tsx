import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ReportSourcesProps {
  citations: string[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const ReportSources = ({ citations }: ReportSourcesProps) => {
  const [open, setOpen] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sources ({citations.length})</CardTitle>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ol className="space-y-1.5 list-decimal list-inside">
              {citations.map((url, idx) => (
                <li
                  key={idx}
                  id={`source-${idx + 1}`}
                  className="text-sm text-muted-foreground scroll-mt-24 transition-colors duration-500 rounded px-1 -mx-1 citation-target"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {extractDomain(url)}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
