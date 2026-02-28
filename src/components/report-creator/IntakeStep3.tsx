import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Building2, Target, Globe, Rocket } from 'lucide-react';
import type { IntakeFormData, ReportPersona } from './intakeSchema';

interface IntakeStep3Props {
  form: UseFormReturn<IntakeFormData>;
  onBack: () => void;
  onSubmit: () => void;
  isGenerating: boolean;
  persona: ReportPersona;
}

export const IntakeStep3 = ({ form, onBack, onSubmit, isGenerating, persona }: IntakeStep3Props) => {
  const data = form.getValues();

  const personaLabel = persona === 'startup' ? 'Startup Growth' : 'International Entry';
  const PersonaIcon = persona === 'startup' ? Rocket : Globe;

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Review & Generate Your Report</CardTitle>
        <CardDescription>Confirm your details and we'll create your personalised {persona === 'startup' ? 'growth' : 'market entry'} report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Persona Badge */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
            <PersonaIcon className="w-4 h-4" />
            {personaLabel}
          </Badge>
        </div>

        {/* Company Details Summary */}
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <Building2 className="w-4 h-4 text-primary" />
            Company Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Company:</span>
              <p className="font-medium">{data.company_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Website:</span>
              <p className="font-medium truncate">{data.website_url}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{persona === 'startup' ? 'Country / State:' : 'Country:'}</span>
              <p className="font-medium">{data.country_of_origin}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Industry / Sector:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.industry_sector?.map((ind) => (
                  <Badge key={ind} variant="secondary" className="text-xs">{ind}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Stage:</span>
              <p className="font-medium">{data.company_stage}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Employees:</span>
              <p className="font-medium">{data.employee_count}</p>
            </div>
            {persona === 'international' && data.target_market && (
              <div>
                <span className="text-muted-foreground">Target Market:</span>
                <p className="font-medium">{data.target_market}</p>
              </div>
            )}
            {persona === 'startup' && data.revenue_stage && (
              <div>
                <span className="text-muted-foreground">Revenue Stage:</span>
                <p className="font-medium">{data.revenue_stage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Goals Summary */}
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-primary" />
            {persona === 'startup' ? 'Growth Goals' : 'Market Entry Goals'}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Selected Goals:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.selected_goals?.map((goal) => (
                  <Badge key={goal} variant="outline" className="text-xs">{goal}</Badge>
                ))}
              </div>
            </div>
            {data.additional_notes && (
              <div>
                <span className="text-muted-foreground">Additional Notes:</span>
                <p className="mt-1">{data.additional_notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={isGenerating} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onSubmit} size="lg" disabled={isGenerating} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Sparkles className="w-4 h-4" />
            Generate My Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
