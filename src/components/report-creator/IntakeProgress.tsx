import { Check } from 'lucide-react';

interface IntakeProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Company Details', 'Market Entry Goals', 'Review & Generate'];

export const IntakeProgress = ({ currentStep, totalSteps }: IntakeProgressProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-5 -left-1/2 w-full h-0.5 transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                    ? 'border-primary bg-background text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNum}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
