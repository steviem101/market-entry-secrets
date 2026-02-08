import { TrendingUp } from 'lucide-react';

interface KeyMetric {
  label: string;
  value: string;
  context: string;
}

interface ReportKeyMetricsProps {
  metrics: KeyMetric[];
}

export const ReportKeyMetrics = ({ metrics }: ReportKeyMetricsProps) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Key Market Metrics</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.slice(0, 6).map((metric, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card p-4 text-center space-y-1 hover:shadow-sm transition-shadow"
          >
            <p className="text-2xl font-bold text-primary">{metric.value}</p>
            <p className="text-sm font-medium text-foreground">{metric.label}</p>
            <p className="text-xs text-muted-foreground">{metric.context}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
