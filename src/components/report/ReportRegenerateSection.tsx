import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SECTION_CONFIG } from './reportSectionConfig';
import { useNavigate } from 'react-router-dom';

interface ReportRegenerateSectionProps {
  id: string;
  title: string;
}

export const ReportRegenerateSection = ({ id, title }: ReportRegenerateSectionProps) => {
  const navigate = useNavigate();
  const config = SECTION_CONFIG[id];
  const Icon = config?.icon;
  const accentBorder = config?.accentColor || '';
  const accentBg = config?.accentBg || 'bg-muted text-muted-foreground';

  return (
    <section id={id} className="scroll-mt-20">
      <Card className={`border-border/50 shadow-sm border-t-[3px] ${accentBorder}`}>
        <CardHeader className="pt-6 px-6 pb-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            {Icon && (
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${accentBg}`}>
                <Icon className="w-5 h-5" />
              </span>
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Content Available with Your Plan
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              This section is now unlocked with your upgraded plan. Generate a new report to see the full {title} analysis.
            </p>
            <Button
              onClick={() => navigate('/report-creator')}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate New Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
