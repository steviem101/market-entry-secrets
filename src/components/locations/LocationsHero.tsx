
import { MapPin, Building2, Users, TrendingUp } from "lucide-react";

export const LocationsHero = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Market Entry Locations
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover the best Australian and New Zealand locations for your market entry. From Sydney's financial district to Auckland's tech scene, find the perfect location for your business expansion.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex flex-col items-center p-6 bg-background/60 backdrop-blur-sm rounded-lg border">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Business Hubs</h3>
              <p className="text-sm text-muted-foreground text-center">
                Major commercial centers with established infrastructure
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-background/60 backdrop-blur-sm rounded-lg border">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Government Support</h3>
              <p className="text-sm text-muted-foreground text-center">
                Access to local trade agencies and business support
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-background/60 backdrop-blur-sm rounded-lg border">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-sm text-muted-foreground text-center">
                Emerging markets and established industry clusters
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
