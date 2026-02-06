import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ReportHeaderProps {
  companyName: string;
  generatedAt: string;
  tier: string;
}

const tierLabels: Record<string, string> = {
  free: 'Free',
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
};

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  growth: 'bg-primary/10 text-primary border-primary/20',
  scale: 'bg-accent/10 text-accent border-accent/20',
  enterprise: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const ReportHeader = ({ companyName, generatedAt, tier }: ReportHeaderProps) => {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/my-reports">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              My Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">{companyName}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(generatedAt), 'MMM d, yyyy')}
              <Badge variant="outline" className={`text-xs ${tierColors[tier] || ''}`}>
                {tierLabels[tier] || tier}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
