import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Persona } from '@/contexts/PersonaContext';

interface CompanyData {
  company_name: string;
  sector: string;
  stage: string;
  origin_country: string;
}

interface PlannerStep2CompanyProps {
  persona: Persona;
  data: CompanyData;
  onChange: (data: CompanyData) => void;
  onNext: () => void;
  onBack: () => void;
}

const STAGE_OPTIONS = ['Pre-revenue', 'Early stage', 'Growth', 'Enterprise'];

const COUNTRY_OPTIONS = [
  'United States', 'United Kingdom', 'Ireland', 'Canada', 'Germany',
  'France', 'Japan', 'Singapore', 'South Korea', 'India', 'Other',
];

export const PlannerStep2Company = ({ persona, data, onChange, onNext, onBack }: PlannerStep2CompanyProps) => {
  const [sectors, setSectors] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch sectors from industry_sectors table
    supabase
      .from('industry_sectors')
      .select('name')
      .then(({ data: sectorData }) => {
        if (sectorData) {
          setSectors(sectorData.map((s) => s.name));
        }
      });

    // Fetch countries from countries table
    supabase
      .from('countries')
      .select('name')
      .then(({ data: countryData }) => {
        if (countryData) {
          setCountries(countryData.map((c) => c.name));
        }
      });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!data.sector) newErrors.sector = 'Sector is required';
    if (!data.stage) newErrors.stage = 'Stage is required';
    if (persona === 'international_entrant' && !data.origin_country) {
      newErrors.origin_country = 'Country of origin is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  // Merge DB countries with fallback options
  const countryList = countries.length > 0
    ? [...new Set([...countries, ...COUNTRY_OPTIONS])]
    : COUNTRY_OPTIONS;

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Tell us about your company</CardTitle>
        <CardDescription>We'll use this to tailor your plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            placeholder="e.g. Acme Corp"
            value={data.company_name}
            onChange={(e) => onChange({ ...data, company_name: e.target.value })}
          />
          {errors.company_name && (
            <p className="text-xs text-destructive">{errors.company_name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sector */}
          <div className="space-y-2">
            <Label>Sector *</Label>
            <Select value={data.sector} onValueChange={(v) => onChange({ ...data, sector: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {(sectors.length > 0 ? sectors : ['Technology', 'Healthcare', 'Finance', 'Education', 'Other']).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sector && (
              <p className="text-xs text-destructive">{errors.sector}</p>
            )}
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <Label>Stage *</Label>
            <Select value={data.stage} onValueChange={(v) => onChange({ ...data, stage: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stage && (
              <p className="text-xs text-destructive">{errors.stage}</p>
            )}
          </div>
        </div>

        {/* Origin Country (only for international entrants) */}
        {persona === 'international_entrant' && (
          <div className="space-y-2">
            <Label>Country of Origin *</Label>
            <Select value={data.origin_country} onValueChange={(v) => onChange({ ...data, origin_country: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.origin_country && (
              <p className="text-xs text-destructive">{errors.origin_country}</p>
            )}
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleNext} size="lg" className="gap-2">
            Next: Your Goals
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
