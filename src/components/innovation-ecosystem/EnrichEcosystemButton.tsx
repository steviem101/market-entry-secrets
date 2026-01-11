import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { firecrawlApi } from '@/lib/api/firecrawl';

interface EnrichEcosystemButtonProps {
  organizations?: any[];
  onEnrichmentComplete?: () => void;
}

export const EnrichEcosystemButton = ({ 
  organizations = [], 
  onEnrichmentComplete 
}: EnrichEcosystemButtonProps) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  const missingCount = organizations.filter(org => !org.basic_info).length;

  const handleEnrich = async (onlyMissing: boolean) => {
    setIsEnriching(true);
    
    try {
      toast({
        title: "Enrichment Started",
        description: `Processing ${onlyMissing ? missingCount : organizations.length} organizations. This may take a few minutes...`,
      });

      const response = await firecrawlApi.enrichInnovationEcosystem(undefined, onlyMissing);

      if (response.success) {
        const results = response.results || [];
        const successCount = results.filter((r: any) => r.success).length;
        const failCount = results.filter((r: any) => !r.success).length;

        toast({
          title: "Enrichment Complete",
          description: `Successfully enriched ${successCount} organizations. ${failCount > 0 ? `${failCount} failed.` : ''}`,
        });

        if (onEnrichmentComplete) {
          onEnrichmentComplete();
        }
      } else {
        toast({
          title: "Enrichment Failed",
          description: response.error || "An error occurred during enrichment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      toast({
        title: "Error",
        description: "Failed to enrich organizations. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isEnriching}
          className="gap-2"
        >
          {isEnriching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich with AI
              {missingCount > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded">
                  {missingCount} missing
                </span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleEnrich(false)}
          disabled={isEnriching}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Enrich All ({organizations.length})
        </DropdownMenuItem>
        {missingCount > 0 && (
          <DropdownMenuItem 
            onClick={() => handleEnrich(true)}
            disabled={isEnriching}
          >
            <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
            Enrich Missing Only ({missingCount})
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnrichEcosystemButton;
