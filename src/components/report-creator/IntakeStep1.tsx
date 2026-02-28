import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Building2, Globe, Rocket, ArrowRight, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COUNTRY_OPTIONS, INDUSTRY_OPTIONS, STAGE_OPTIONS, EMPLOYEE_OPTIONS,
  TARGET_MARKET_OPTIONS, REVENUE_STAGE_OPTIONS,
  type IntakeFormData, type ReportPersona,
} from './intakeSchema';

interface IntakeStep1Props {
  form: UseFormReturn<IntakeFormData>;
  onNext: () => void;
  persona: ReportPersona;
  onPersonaChange: (persona: ReportPersona) => void;
}

export const IntakeStep1 = ({ form, onNext, persona, onPersonaChange }: IntakeStep1Props) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const [industryOpen, setIndustryOpen] = useState(false);
  const selectedIndustries = watch('industry_sector') || [];

  const countryValue = watch('country_of_origin');
  const presetCountries = COUNTRY_OPTIONS.filter(c => c !== 'Other');
  const isOther = countryValue !== '' && !presetCountries.includes(countryValue as any);
  const [customCountry, setCustomCountry] = useState(() => isOther ? countryValue : '');
  const selectDisplayValue = isOther ? 'Other' : countryValue;

  const handleCountrySelect = (value: string) => {
    if (value === 'Other') {
      setValue('country_of_origin', customCountry, { shouldValidate: true });
    } else {
      setValue('country_of_origin', value, { shouldValidate: true });
      setCustomCountry('');
    }
  };

  const handleCustomCountryChange = (value: string) => {
    setCustomCountry(value);
    setValue('country_of_origin', value, { shouldValidate: true });
  };
  const toggleIndustry = (industry: string) => {
    const current = selectedIndustries;
    if (current.includes(industry)) {
      setValue('industry_sector', current.filter((i) => i !== industry), { shouldValidate: true });
    } else {
      setValue('industry_sector', [...current, industry], { shouldValidate: true });
    }
  };

  const removeIndustry = (industry: string) => {
    setValue('industry_sector', selectedIndustries.filter((i) => i !== industry), { shouldValidate: true });
  };

  const toggleOptions = [
    { key: 'international' as const, icon: Globe, label: 'International Entry', desc: 'Entering the ANZ market' },
    { key: 'startup' as const, icon: Rocket, label: 'Startup Growth', desc: 'Growing your Aussie startup' },
  ];

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
        {/* Persona Toggle */}
        <div className="w-full">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-3">
            Choose your journey
          </p>
          <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Choose your journey">
            {toggleOptions.map((option) => {
              const Icon = option.icon;
              const isActive = persona === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onPersonaChange(option.key)}
                  className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'bg-background shadow-lg border-primary/30 ring-2 ring-primary/20 scale-[1.02]'
                      : 'bg-muted/50 border-border opacity-70 hover:opacity-90 hover:border-primary/20'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-primary/20 to-accent/20'
                        : 'bg-muted'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-base font-semibold transition-colors duration-300 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {option.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
            <Label>{persona === 'startup' ? 'Country / State *' : 'Country of Origin *'}</Label>
            <Select value={selectDisplayValue} onValueChange={handleCountrySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOther && (
              <Input
                placeholder="Enter your country"
                value={customCountry}
                onChange={(e) => handleCustomCountryChange(e.target.value)}
              />
            )}
            {errors.country_of_origin && (
              <p className="text-xs text-destructive">{errors.country_of_origin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Industry / Sector *</Label>
            <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={industryOpen}
                  className={cn(
                    "w-full justify-between font-normal h-10",
                    selectedIndustries.length === 0 && "text-muted-foreground"
                  )}
                >
                  {selectedIndustries.length === 0
                    ? "Select industries"
                    : `${selectedIndustries.length} selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search industry..." />
                  <CommandList>
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {INDUSTRY_OPTIONS.map((industry) => (
                        <CommandItem
                          key={industry}
                          value={industry}
                          onSelect={() => toggleIndustry(industry)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedIndustries.includes(industry) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {industry}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedIndustries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedIndustries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="text-xs gap-1 pr-1">
                    {ind}
                    <button
                      type="button"
                      onClick={() => removeIndustry(ind)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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

        {/* Persona-specific fields */}
        {persona === 'international' && (
          <div className="space-y-2">
            <Label>Target Market</Label>
            <Select value={watch('target_market') || ''} onValueChange={(v) => setValue('target_market', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target market" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_MARKET_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {persona === 'startup' && (
          <div className="space-y-2">
            <Label>Current ARR / Revenue Stage</Label>
            <Select value={watch('revenue_stage') || ''} onValueChange={(v) => setValue('revenue_stage', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select revenue stage" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_STAGE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button onClick={onNext} size="lg" className="gap-2">
            Next: {persona === 'startup' ? 'Growth Goals' : 'Market Entry Goals'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
