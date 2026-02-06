import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReportCreatorCTAProps {
  className?: string;
}

export const ReportCreatorCTA = ({ className }: ReportCreatorCTAProps) => {
  return (
    <Card className={`border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 ${className || ''}`}>
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-semibold text-foreground">Get Your Free Market Entry Report</h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights matched with our vetted directory of service providers and mentors.
          </p>
        </div>
        <Link to="/report-creator">
          <Button className="gap-2 shrink-0">
            Create Report
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
