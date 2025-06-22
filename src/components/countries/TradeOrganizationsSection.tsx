
import { useCountryTradeOrganizations } from "@/hooks/useCountryTradeOrganizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Building, Users } from "lucide-react";

interface TradeOrganizationsSectionProps {
  countrySlug: string;
}

const TradeOrganizationsSection = ({ countrySlug }: TradeOrganizationsSectionProps) => {
  const { data: organizations = [], isLoading } = useCountryTradeOrganizations(countrySlug);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trade & Investment Organizations</h2>
            <div className="h-4 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>
          <div className="grid gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (organizations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trade & Investment Organizations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with government agencies and chambers of commerce that support market entry and business development.
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{org.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {org.organization_type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        Est. {org.founded}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {org.employees} employees
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{org.description}</p>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Services Offered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {org.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Why Work With Us */}
                {org.why_work_with_us && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">Why Work With Us:</h4>
                    <p className="text-sm">{org.why_work_with_us}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {org.website && (
                    <Button variant="default" asChild>
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  {org.contact && (
                    <Button variant="outline" asChild>
                      <a href={`mailto:${org.contact}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Us
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TradeOrganizationsSection;
