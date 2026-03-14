import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Building2, Target, Globe, Rocket, Clock, DollarSign, Swords, AlertTriangle, Users } from 'lucide-react';
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
            {data.target_regions && data.target_regions.length > 0 && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Target Regions:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.target_regions.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
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
            {data.timeline && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Timeline:</span>
                  <p className="font-medium">{data.timeline}</p>
                </div>
              </div>
            )}
            {data.budget_level && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p className="font-medium">{data.budget_level}</p>
                </div>
              </div>
            )}
            {data.known_competitors && data.known_competitors.length > 0 && (
              <div className="flex items-start gap-2">
                <Swords className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Known Competitors:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.known_competitors.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{c.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {data.target_customer_description && (
              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Target Customer Profile:</span>
                  <p className="mt-1">{data.target_customer_description}</p>
                </div>
              </div>
            )}
            {data.end_buyer_industries && data.end_buyer_industries.length > 0 && (
              <div>
                <span className="text-muted-foreground">Target Customer Industries:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.end_buyer_industries.map((ind) => (
                    <Badge key={ind} variant="secondary" className="text-xs">{ind}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.end_buyers && data.end_buyers.length > 0 && (
              <div>
                <span className="text-muted-foreground">End Buyers:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.end_buyers.map((b, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{b.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.key_challenges && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Key Challenges:</span>
                  <p className="mt-1">{data.key_challenges}</p>
                </div>
              </div>
            )}
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
