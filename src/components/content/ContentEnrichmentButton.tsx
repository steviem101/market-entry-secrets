import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  hasContent: boolean;
}

interface ContentEnrichmentButtonProps {
  contentId: string;
  contentTitle: string;
  sectionCount: number;
  sections?: ContentSection[];
  onEnrichmentComplete?: () => void;
}

export const ContentEnrichmentButton = ({
  contentId,
  contentTitle,
  sectionCount,
  sections = [],
  onEnrichmentComplete,
}: ContentEnrichmentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ section: string; success: boolean; error?: string }[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrichMode, setEnrichMode] = useState<'all' | 'missing'>('all');
  const { toast } = useToast();

  const missingSections = sections.filter(s => !s.hasContent);
  const hasMissingSections = missingSections.length > 0 && missingSections.length < sections.length;

  const handleEnrich = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      // If enriching only missing sections, pass their IDs
      const sectionIds = enrichMode === 'missing' && hasMissingSections 
        ? missingSections.map(s => s.id) 
        : undefined;

      const response = await firecrawlApi.enrichContent(contentId, sectionIds);

      if (response.success) {
        setResults(response.results || []);
        const successCount = response.results?.filter(r => r.success).length || 0;
        
        toast({
          title: 'Content Enriched',
          description: response.message || `Successfully enriched ${successCount} sections`,
        });

        if (onEnrichmentComplete) {
          onEnrichmentComplete();
        }
      } else {
        toast({
          title: 'Enrichment Failed',
          description: response.error || 'Failed to enrich content',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during enrichment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (mode: 'all' | 'missing') => {
    setEnrichMode(mode);
    setResults(null);
    setDialogOpen(true);
  };

  const targetSectionCount = enrichMode === 'missing' ? missingSections.length : sectionCount;

  return (
    <>
      {hasMissingSections ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enrich with AI
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog('missing')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Complete {missingSections.length} missing section{missingSections.length > 1 ? 's' : ''}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDialog('all')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Re-enrich all {sectionCount} sections
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="gap-2"
          onClick={() => openDialog('all')}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Enrich with AI
            </>
          )}
        </Button>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {enrichMode === 'missing' 
                ? `Complete ${missingSections.length} Missing Section${missingSections.length > 1 ? 's' : ''}`
                : 'Enrich Content with AI'
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will use Firecrawl to search the web for relevant information about 
                <strong> "{contentTitle}"</strong> and use AI to synthesize content for 
                <strong> {targetSectionCount} section{targetSectionCount > 1 ? 's' : ''}</strong>.
              </p>
              
              {enrichMode === 'missing' && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Sections to enrich:</p>
                  <ul className="text-sm space-y-1">
                    {missingSections.map(s => (
                      <li key={s.id} className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        {s.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-amber-600">
                ⚠️ This process may take 1-2 minutes and will consume API credits.
              </p>
              
              {results && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  <p className="font-medium">Results:</p>
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {r.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{r.section}</span>
                      {r.error && <span className="text-muted-foreground">- {r.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnrich} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Start Enrichment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
