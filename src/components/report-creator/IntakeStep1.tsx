import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Globe, ArrowRight } from 'lucide-react';
import {
  COUNTRY_OPTIONS, INDUSTRY_OPTIONS, STAGE_OPTIONS, EMPLOYEE_OPTIONS,
  type IntakeFormData,
} from './intakeSchema';

interface IntakeStep1Props {
  form: UseFormReturn<IntakeFormData>;
  onNext: () => void;
}

export const IntakeStep1 = ({ form, onNext }: IntakeStep1Props) => {
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Tell us about your company</CardTitle>
        <CardDescription>We'll use this to match you with the right resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              placeholder="e.g. Acme Corp"
              {...register('company_name')}
            />
            {errors.company_name && (
              <p className="text-xs text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Company Website *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="website_url"
                placeholder="https://example.com"
                className="pl-10"
                {...register('website_url')}
              />
            </div>
            {errors.website_url && (
              <p className="text-xs text-destructive">{errors.website_url.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Country of Origin *</Label>
            <Select value={watch('country_of_origin')} onValueChange={(v) => setValue('country_of_origin', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country_of_origin && (
              <p className="text-xs text-destructive">{errors.country_of_origin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Industry / Sector *</Label>
            <Select value={watch('industry_sector')} onValueChange={(v) => setValue('industry_sector', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry_sector && (
              <p className="text-xs text-destructive">{errors.industry_sector.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Company Stage *</Label>
            <Select value={watch('company_stage')} onValueChange={(v) => setValue('company_stage', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company_stage && (
              <p className="text-xs text-destructive">{errors.company_stage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Number of Employees *</Label>
            <Select value={watch('employee_count')} onValueChange={(v) => setValue('employee_count', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_count && (
              <p className="text-xs text-destructive">{errors.employee_count.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={onNext} size="lg" className="gap-2">
            Next: Market Entry Goals
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
