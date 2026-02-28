import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  INTERNATIONAL_GOALS, STARTUP_GOALS,
  type IntakeFormData, type ReportPersona,
} from './intakeSchema';

interface IntakeStep2Props {
  form: UseFormReturn<IntakeFormData>;
  onNext: () => void;
  onBack: () => void;
  persona: ReportPersona;
}

export const IntakeStep2 = ({ form, onNext, onBack, persona }: IntakeStep2Props) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const selectedGoals = watch('selected_goals') || [];
  const additionalNotes = watch('additional_notes') || '';

  const goals = persona === 'startup' ? STARTUP_GOALS : INTERNATIONAL_GOALS;

  const toggleGoal = (goal: string) => {
    const current = selectedGoals;
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    setValue('selected_goals', updated, { shouldValidate: true });
  };

  const StepIcon = persona === 'startup' ? Rocket : Target;
  const stepTitle = persona === 'startup' ? 'Your Growth Goals' : 'Your Market Entry Goals';
  const stepDescription = persona === 'startup'
    ? 'Select the goals most relevant to scaling your startup'
    : 'Select the goals most relevant to your market entry';

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <StepIcon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{stepTitle}</CardTitle>
        <CardDescription>{stepDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Goals Multi-select */}
        <div className="space-y-3">
          <Label>What do you want your report to focus on? *</Label>
          <div className="grid grid-cols-1 gap-2">
            {goals.map((goal) => (
              <label
                key={goal}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedGoals.includes(goal)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={() => toggleGoal(goal)}
                />
                <span className="text-sm">{goal}</span>
              </label>
            ))}
          </div>
          {errors.selected_goals && (
            <p className="text-xs text-destructive">{errors.selected_goals.message}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additional_notes">Anything else you want your report to cover?</Label>
          <Textarea
            id="additional_notes"
            placeholder="e.g. specific regulations, niche markets, particular challenges..."
            maxLength={500}
            className="resize-none"
            rows={3}
            {...register('additional_notes')}
          />
          <p className="text-xs text-muted-foreground text-right">{additionalNotes.length}/500</p>
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext} size="lg" className="gap-2">
            Review & Generate
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
