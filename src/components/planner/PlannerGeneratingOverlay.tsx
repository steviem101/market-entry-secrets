import { useEffect, useState } from 'react';
import { Loader2, Search, Database, Brain, FileText, Check } from 'lucide-react';

const STEPS = [
  { label: 'Analysing your company profile...', icon: Search, duration: 5000 },
  { label: 'Matching providers & mentors...', icon: Database, duration: 10000 },
  { label: 'Finding relevant events & reports...', icon: Brain, duration: 15000 },
  { label: 'Generating your tailored plan...', icon: FileText, duration: 20000 },
];

interface PlannerGeneratingOverlayProps {
  isVisible: boolean;
}

export const PlannerGeneratingOverlay = ({ isVisible }: PlannerGeneratingOverlayProps) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    STEPS.forEach((step, index) => {
      if (index > 0) {
        cumulative += step.duration;
        timers.push(setTimeout(() => setActiveStep(index), cumulative));
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-border bg-card shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Building Your Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Matching you with the best resources...
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isComplete = index < activeStep;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : isComplete
                    ? 'bg-muted/50'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
