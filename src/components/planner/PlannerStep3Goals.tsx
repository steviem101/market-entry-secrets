import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Target, ArrowLeft, Sparkles } from 'lucide-react';
import type { Persona } from '@/contexts/PersonaContext';

interface PlannerStep3GoalsProps {
  persona: Persona;
  goals: string[];
  onChange: (goals: string[]) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const INTERNATIONAL_GOALS = [
  'Market sizing & validation',
  'Entity & legal setup',
  'Hiring & recruitment',
  'Finding local partners',
  'Regulatory & compliance',
  'Go-to-market strategy',
];

const LOCAL_GOALS = [
  'Raising funding',
  'Accelerator / program access',
  'Grants & government support',
  'Hiring first team',
  'Finding first customers',
  'Mentorship & advisory',
];

export const PlannerStep3Goals = ({
  persona,
  goals,
  onChange,
  onBack,
  onGenerate,
  isGenerating,
}: PlannerStep3GoalsProps) => {
  const goalOptions = persona === 'international_entrant' ? INTERNATIONAL_GOALS : LOCAL_GOALS;

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      onChange(goals.filter((g) => g !== goal));
    } else {
      onChange([...goals, goal]);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">What are your goals?</CardTitle>
        <CardDescription>Select all that apply. We'll tailor your plan to these priorities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goalOptions.map((goal) => (
            <div
              key={goal}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                goals.includes(goal)
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border/50 hover:border-primary/30'
              }`}
              onClick={() => toggleGoal(goal)}
            >
              <Checkbox
                checked={goals.includes(goal)}
                onCheckedChange={() => toggleGoal(goal)}
              />
              <Label className="cursor-pointer text-sm font-medium">{goal}</Label>
            </div>
          ))}
        </div>

        {goals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">Select at least one goal to generate your plan.</p>
        )}

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={onGenerate}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            disabled={goals.length === 0 || isGenerating}
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate My Plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
