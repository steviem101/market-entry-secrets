import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowLeft, ArrowRight, Plus, X, Globe } from 'lucide-react';
import { EndBuyersSection } from './EndBuyersSection';
import {
  REGION_OPTIONS, SERVICES_OPTIONS, TIMELINE_OPTIONS, BUDGET_OPTIONS,
  type IntakeFormData,
} from './intakeSchema';

interface IntakeStep2Props {
  form: UseFormReturn<IntakeFormData>;
  onNext: () => void;
  onBack: () => void;
}

export const IntakeStep2 = ({ form, onNext, onBack }: IntakeStep2Props) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const targetRegions = watch('target_regions') || [];
  const servicesNeeded = watch('services_needed') || [];
  const primaryGoals = watch('primary_goals') || '';
  const keyChallenges = watch('key_challenges') || '';
  const knownCompetitors = watch('known_competitors') || [];

  const toggleArrayItem = (field: 'target_regions' | 'services_needed', item: string) => {
    const current = watch(field) || [];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setValue(field, updated, { shouldValidate: true });
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Your Market Entry Goals</CardTitle>
        <CardDescription>Help us understand what you need to succeed in Australia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Target Regions */}
        <div className="space-y-3">
          <Label>Target Regions in Australia *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {REGION_OPTIONS.map((region) => (
              <label
                key={region}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  targetRegions.includes(region)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={targetRegions.includes(region)}
                  onCheckedChange={() => toggleArrayItem('target_regions', region)}
                />
                <span className="text-sm">{region}</span>
              </label>
            ))}
          </div>
          {errors.target_regions && (
            <p className="text-xs text-destructive">{errors.target_regions.message}</p>
          )}
        </div>

        {/* Services Needed */}
        <div className="space-y-3">
          <Label>Services Needed *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SERVICES_OPTIONS.map((service) => (
              <label
                key={service}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  servicesNeeded.includes(service)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={servicesNeeded.includes(service)}
                  onCheckedChange={() => toggleArrayItem('services_needed', service)}
                />
                <span className="text-sm">{service}</span>
              </label>
            ))}
          </div>
          {errors.services_needed && (
            <p className="text-xs text-destructive">{errors.services_needed.message}</p>
          )}
        </div>

        {/* Timeline & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Timeline *</Label>
            <Select value={watch('timeline')} onValueChange={(v) => setValue('timeline', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timeline && (
              <p className="text-xs text-destructive">{errors.timeline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Budget Level *</Label>
            <Select value={watch('budget_level')} onValueChange={(v) => setValue('budget_level', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budget_level && (
              <p className="text-xs text-destructive">{errors.budget_level.message}</p>
            )}
          </div>
        </div>

        {/* Goals & Challenges */}
        <div className="space-y-2">
          <Label htmlFor="primary_goals">Primary Goals</Label>
          <Textarea
            id="primary_goals"
            placeholder="What are you hoping to achieve in the Australian market?"
            maxLength={500}
            className="resize-none"
            rows={3}
            {...register('primary_goals')}
          />
          <p className="text-xs text-muted-foreground text-right">{primaryGoals.length}/500</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="key_challenges">Key Challenges</Label>
          <Textarea
            id="key_challenges"
            placeholder="What are your biggest concerns about entering this market?"
            maxLength={500}
            className="resize-none"
            rows={3}
            {...register('key_challenges')}
          />
          <p className="text-xs text-muted-foreground text-right">{keyChallenges.length}/500</p>
        </div>

        {/* End Buyers */}
        <EndBuyersSection form={form} />

        {/* Known Competitors */}
        <div className="space-y-3">
          <div>
            <Label>Known Competitors</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add companies you consider direct competitors in the Australian market (optional, max 5)
            </p>
          </div>
          
          {knownCompetitors.map((competitor, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="e.g. Acme Corp"
                  value={competitor.name}
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
                    value={competitor.website}
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
                  const updated = knownCompetitors.filter((_, i) => i !== index);
                  setValue('known_competitors', updated, { shouldValidate: true });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {knownCompetitors.length < 5 && (
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

          {errors.known_competitors && (
            <p className="text-xs text-destructive">
              {typeof errors.known_competitors.message === 'string'
                ? errors.known_competitors.message
                : 'Please fix competitor entries'}
            </p>
          )}
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
