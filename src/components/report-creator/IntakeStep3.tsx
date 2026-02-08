import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Building2, MapPin, Briefcase, Clock, DollarSign, Swords, ExternalLink, Users } from 'lucide-react';
import type { IntakeFormData } from './intakeSchema';

interface IntakeStep3Props {
  form: UseFormReturn<IntakeFormData>;
  onBack: () => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const IntakeStep3 = ({ form, onBack, onSubmit, isGenerating }: IntakeStep3Props) => {
  const data = form.getValues();

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Review & Generate Your Report</CardTitle>
        <CardDescription>Confirm your details and we'll create your personalised market entry report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
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
              <span className="text-muted-foreground">Country:</span>
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
          </div>
        </div>

        {/* Market Entry Goals Summary */}
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Market Entry Goals
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Target Regions:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.target_regions?.map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Services Needed:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.services_needed?.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Timeline:</span>
                  <p className="font-medium">{data.timeline}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p className="font-medium">{data.budget_level}</p>
                </div>
              </div>
            </div>
            {data.primary_goals && (
              <div>
                <span className="text-muted-foreground">Goals:</span>
                <p className="mt-1">{data.primary_goals}</p>
              </div>
            )}
            {data.key_challenges && (
              <div>
                <span className="text-muted-foreground">Challenges:</span>
                <p className="mt-1">{data.key_challenges}</p>
              </div>
            )}
          </div>
        </div>

        {/* End Buyers Summary */}
        {((data.end_buyer_industries && data.end_buyer_industries.length > 0) || (data.end_buyers && data.end_buyers.length > 0)) && (
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              End Buyers / Target Customers
            </h3>
            <div className="space-y-2 text-sm">
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
                  <span className="text-muted-foreground">Example End Buyers:</span>
                  <div className="space-y-1.5 mt-1">
                    {data.end_buyers.map((b, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="font-medium">{b.name}</span>
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-xs truncate max-w-[200px]"
                        >
                          {b.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Known Competitors Summary */}
        {data.known_competitors && data.known_competitors.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <Swords className="w-4 h-4 text-primary" />
              Known Competitors
            </h3>
            <div className="space-y-2 text-sm">
              {data.known_competitors.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{c.name}</span>
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-xs truncate max-w-[200px]"
                  >
                    {c.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

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
