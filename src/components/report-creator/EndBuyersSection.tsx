import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, X, Plus, Users } from 'lucide-react';
import { IndustrySelect } from '@/components/common/IndustrySelect';
import { type IntakeFormData } from './intakeSchema';

interface EndBuyersSectionProps {
  form: UseFormReturn<IntakeFormData>;
}

export const EndBuyersSection = ({ form }: EndBuyersSectionProps) => {
  const { setValue, watch, formState: { errors } } = form;
  const endBuyerIndustries = watch('end_buyer_industries') || [];
  const endBuyers = watch('end_buyers') || [];

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
        <IndustrySelect
          value={endBuyerIndustries}
          onChange={(v) => setValue('end_buyer_industries', v, { shouldValidate: true })}
          placeholder="Select industries your customers belong to"
          maxSelections={5}
        />
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
