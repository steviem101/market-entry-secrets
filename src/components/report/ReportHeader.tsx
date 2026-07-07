import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Calendar, Globe, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ReportShareDialog } from './ReportShareDialog';
import { TIER_LABELS } from './reportSectionConfig';

interface ReportHeaderProps {
  companyName: string;
  generatedAt: string;
  tier: string;
  perplexityUsed?: boolean;
  reportId: string;
  shareToken: string | null;
  onShareTokenChange: (token: string | null) => void;
  readingTimeMinutes?: number;
}

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  growth: 'bg-primary/10 text-primary border-primary/20',
  scale: 'bg-accent/10 text-accent border-accent/20',
  enterprise: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const ReportHeader = ({
  companyName,
  generatedAt,
  tier,
  perplexityUsed,
  reportId,
  shareToken,
  onShareTokenChange,
  readingTimeMinutes,
}: ReportHeaderProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/my-reports" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" aria-label="My Reports">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">My Reports</span>
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">Market Entry Report: {companyName}</h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  {format(new Date(generatedAt), 'MMM d, yyyy')}
                </span>
                <Badge variant="outline" className={`text-xs ${tierColors[tier] || ''}`}>
                  {TIER_LABELS[tier] || tier}
                </Badge>
                {perplexityUsed && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Globe className="w-3 h-3" />
                    AI Research
                  </Badge>
                )}
                {readingTimeMinutes && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {readingTimeMinutes} min read
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block px-8 pt-8 pb-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1">Market Entry Secrets</p>
        <h1 className="text-2xl font-bold text-foreground">Market Entry Report: {companyName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Market Entry Report • {format(new Date(generatedAt), 'MMMM d, yyyy')} • {TIER_LABELS[tier] || tier} Plan
        </p>
      </div>

      <ReportShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        reportId={reportId}
        shareToken={shareToken}
        onTokenChange={onShareTokenChange}
      />
    </>
  );
};
