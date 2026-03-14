import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, ArrowLeft, ArrowRight, Clock, DollarSign, Swords, Globe, Plus, X, AlertTriangle, Users } from 'lucide-react';
import {
  INTERNATIONAL_GOALS, STARTUP_GOALS, TIMELINE_OPTIONS, BUDGET_OPTIONS,
  type IntakeFormData, type ReportPersona,
} from './intakeSchema';
import { EndBuyersSection } from './EndBuyersSection';

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
  const keyChallenges = watch('key_challenges') || '';
  const targetCustomerDesc = watch('target_customer_description') || '';
  const knownCompetitors = watch('known_competitors') || [];
  const selectedIndustries = watch('industry_sector') || [];
  const companyStage = watch('company_stage') || '';

  const goals = persona === 'startup' ? STARTUP_GOALS : INTERNATIONAL_GOALS;

  const toggleGoal = (goal: string) => {
    const current = selectedGoals;
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    setValue('selected_goals', updated, { shouldValidate: true });
  };

  // Conditional visibility helpers
  const showBudget = companyStage !== 'Startup/Seed' || persona === 'international';
  const isRegulatedIndustry = selectedIndustries.some((ind: string) =>
    /health care|medical|pharma|banking|insurance|financial services|capital markets|investment|biotechnology/i.test(ind)
  );

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

        {/* Timeline & Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Timeline
            </Label>
            <Select value={watch('timeline') || ''} onValueChange={(v) => setValue('timeline', v)}>
              <SelectTrigger>
                <SelectValue placeholder="When are you looking to enter?" />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showBudget && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Budget for Market Entry Services
              </Label>
              <Select value={watch('budget_level') || ''} onValueChange={(v) => setValue('budget_level', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Known Competitors */}
        <div className="space-y-3">
          <div>
            <Label className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary" />
              {persona === 'startup' ? 'Key Competitors' : 'Known Competitors in ANZ'}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add competitors already operating in Australia. We'll research them and include a competitive landscape in your report. (optional, max 3)
            </p>
          </div>

          {knownCompetitors.map((comp: { name: string; website: string }, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="e.g. CompetitorCo"
                  value={comp.name}
                  onChange={(e) => {
                    const updated = [...knownCompetitors];
                    updated[index] = { ...updated[index], name: e.target.value };
                    setValue('known_competitors', updated, { shouldValidate: true });
                  }}
                />
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://competitor.com"
                    className="pl-10"
                    value={comp.website}
                    onChange={(e) => {
                      const updated = [...knownCompetitors];
                      updated[index] = { ...updated[index], website: e.target.value };
                      setValue('known_competitors', updated, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 mt-0.5"
                onClick={() => {
                  setValue('known_competitors', knownCompetitors.filter((_: any, i: number) => i !== index), { shouldValidate: true });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {knownCompetitors.length < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setValue('known_competitors', [...knownCompetitors, { name: '', website: '' }], { shouldValidate: false });
              }}
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </Button>
          )}
        </div>

        {/* Target Customer Description */}
        <div className="space-y-2">
          <Label htmlFor="target_customer_description" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Target Customer Profile
          </Label>
          <p className="text-xs text-muted-foreground">
            Who are you trying to sell to in Australia? This helps us match lead data and tailor go-to-market recommendations.
          </p>
          <Textarea
            id="target_customer_description"
            placeholder={persona === 'startup'
              ? 'e.g. B2B SaaS companies with 50-500 employees in financial services, looking for workflow automation...'
              : 'e.g. mid-market retailers in NSW and VIC, procurement teams at enterprise mining companies...'}
            maxLength={500}
            className="resize-none"
            rows={3}
            {...register('target_customer_description')}
          />
          <p className="text-xs text-muted-foreground text-right">{targetCustomerDesc.length}/500</p>
        </div>

        {/* End Buyers */}
        <EndBuyersSection form={form} />

        {/* Key Challenges / Concerns */}
        <div className="space-y-2">
          <Label htmlFor="key_challenges" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Key Challenges or Concerns
          </Label>
          {isRegulatedIndustry && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Regulatory and compliance concerns are especially relevant for your sector — be as specific as you can.
            </p>
          )}
          <Textarea
            id="key_challenges"
            placeholder={persona === 'startup'
              ? 'e.g. finding product-market fit in ANZ, navigating funding landscape, hiring locally...'
              : 'e.g. regulatory hurdles, cultural differences, logistics, finding the right partners...'}
            maxLength={500}
            className="resize-none"
            rows={3}
            {...register('key_challenges')}
          />
          <p className="text-xs text-muted-foreground text-right">{keyChallenges.length}/500</p>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additional_notes">Anything else you want your report to cover?</Label>
          <Textarea
            id="additional_notes"
            placeholder="e.g. specific regulations, niche markets, partnership opportunities..."
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
