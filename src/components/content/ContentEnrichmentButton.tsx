import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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

interface ContentEnrichmentButtonProps {
  contentId: string;
  contentTitle: string;
  sectionCount: number;
  onEnrichmentComplete?: () => void;
}

export const ContentEnrichmentButton = ({
  contentId,
  contentTitle,
  sectionCount,
  onEnrichmentComplete,
}: ContentEnrichmentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ section: string; success: boolean; error?: string }[] | null>(null);
  const { toast } = useToast();

  const handleEnrich = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await firecrawlApi.enrichContent(contentId);

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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
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
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enrich Content with AI</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will use Firecrawl to search the web for relevant information about 
              <strong> "{contentTitle}"</strong> and use AI to synthesize content for 
              <strong> {sectionCount} sections</strong>.
            </p>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnrich} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Start Enrichment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
