import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, X, Plus, Globe, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDUSTRY_OPTIONS, type IntakeFormData } from './intakeSchema';

interface EndBuyersSectionProps {
  form: UseFormReturn<IntakeFormData>;
}

export const EndBuyersSection = ({ form }: EndBuyersSectionProps) => {
  const { setValue, watch, formState: { errors } } = form;
  const [industryOpen, setIndustryOpen] = useState(false);
  const endBuyerIndustries = watch('end_buyer_industries') || [];
  const endBuyers = watch('end_buyers') || [];

  const toggleIndustry = (industry: string) => {
    const current = endBuyerIndustries;
    if (current.includes(industry)) {
      setValue('end_buyer_industries', current.filter((i) => i !== industry), { shouldValidate: true });
    } else {
      setValue('end_buyer_industries', [...current, industry], { shouldValidate: true });
    }
  };

  const removeIndustry = (industry: string) => {
    setValue('end_buyer_industries', endBuyerIndustries.filter((i) => i !== industry), { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          End Buyers / Target Customers
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Who are you selling to in Australia? This helps us tailor your report. (optional)
        </p>
      </div>

      {/* End Buyer Industries */}
      <div className="space-y-2">
        <Label className="text-sm">Target Customer Industries</Label>
        <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={industryOpen}
              className={cn(
                "w-full justify-between font-normal h-10",
                endBuyerIndustries.length === 0 && "text-muted-foreground"
              )}
            >
              {endBuyerIndustries.length === 0
                ? "Select industries your customers belong to"
                : `${endBuyerIndustries.length} selected`}
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
                          endBuyerIndustries.includes(industry) ? "opacity-100" : "opacity-0"
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
        {endBuyerIndustries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {endBuyerIndustries.map((ind) => (
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
      </div>

      {/* Example End Buyers */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm">Example End Buyers</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add specific companies you want to sell to in Australia (optional, max 5)
          </p>
        </div>

        {endBuyers.map((buyer, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="e.g. Woolworths"
                value={buyer.name}
                onChange={(e) => {
                  const updated = [...endBuyers];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setValue('end_buyers', updated, { shouldValidate: true });
                }}
              />
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://company.com.au"
                  className="pl-10"
                  value={buyer.website}
                  onChange={(e) => {
                    const updated = [...endBuyers];
                    updated[index] = { ...updated[index], website: e.target.value };
                    setValue('end_buyers', updated, { shouldValidate: true });
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
                const updated = endBuyers.filter((_, i) => i !== index);
                setValue('end_buyers', updated, { shouldValidate: true });
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {endBuyers.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setValue('end_buyers', [...endBuyers, { name: '', website: '' }], { shouldValidate: false });
            }}
          >
            <Plus className="w-4 h-4" />
            Add End Buyer
          </Button>
        )}

        {errors.end_buyers && (
          <p className="text-xs text-destructive">
            {typeof errors.end_buyers.message === 'string'
              ? errors.end_buyers.message
              : 'Please fix end buyer entries'}
          </p>
        )}
      </div>
    </div>
  );
};
