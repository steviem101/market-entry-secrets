
import Navigation from "@/components/Navigation";
import { getAllSectors } from "@/config/sectors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Building2, Calendar, FileText } from "lucide-react";
import SectorHero from "@/components/sectors/SectorHero";

const Sectors = () => {
  const sectors = getAllSectors();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <SectorHero 
        title="Industry Sectors"
        description="Explore specialized market entry solutions across different industries"
      />

      {/* Sectors Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {sectors.map((sector) => (
            <Card key={sector.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{sector.name}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {sector.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Key Industries */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">KEY INDUSTRIES</h4>
                    <div className="flex flex-wrap gap-2">
                      {sector.industries.slice(0, 3).map((industry) => (
                        <span
                          key={industry}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                        >
                          {industry}
                        </span>
                      ))}
                      {sector.industries.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{sector.industries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features Available */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">AVAILABLE RESOURCES</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>Service Providers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Events</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Content</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Experts</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/sectors/${sector.id}`}>
                    <Button className="w-full">
                      Explore {sector.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Don't see your sector?</h2>
          <p className="text-muted-foreground mb-6">
            We're continuously expanding our sector coverage. Contact us to discuss your specific industry needs.
          </p>
          <Link to="/contact">
            <Button size="lg">Get in Touch</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sectors;
