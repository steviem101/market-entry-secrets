
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Phone, Mail } from "lucide-react";
import { LocationData } from "@/hooks/useLocations";

interface GovernmentAgencySectionProps {
  location: LocationData;
}

export const GovernmentAgencySection = ({ location }: GovernmentAgencySectionProps) => {
  if (!location.government_agency_name) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Government Support</h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{location.government_agency_name}</CardTitle>
                  <p className="text-muted-foreground">
                    Official trade and investment agency for {location.name}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                The {location.government_agency_name} provides comprehensive support for businesses looking to establish or expand their operations in {location.name}. They offer guidance on regulations, incentives, and can connect you with local partners and resources.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {location.government_agency_website && (
                  <Button asChild>
                    <a href={location.government_agency_website} target="_blank" rel="noopener noreferrer">
                      Visit Official Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                {location.government_agency_contact && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${location.government_agency_contact}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Agency
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Services Available:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Market entry guidance and strategy</li>
                  <li>• Regulatory compliance assistance</li>
                  <li>• Local partner introductions</li>
                  <li>• Investment incentives information</li>
                  <li>• Site selection support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
