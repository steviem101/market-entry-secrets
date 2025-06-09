
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lightbulb, Network, Target, TrendingUp, Globe } from "lucide-react";

const InnovationEcosystem = () => {
  const ecosystemFeatures = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Startup Incubators",
      description: "Connect with leading Australian startup incubators and accelerators to fast-track your market entry."
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation Hubs",
      description: "Access state-of-the-art innovation centers across major Australian cities for collaboration and growth."
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "Ecosystem Mapping",
      description: "Navigate the complex Australian innovation landscape with our comprehensive ecosystem mapping services."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Technology Transfer",
      description: "Facilitate technology transfer between international companies and Australian research institutions."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Scale-up Support",
      description: "Support for scaling your innovation from pilot to full market deployment across Australia."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Connections",
      description: "Bridge international innovation ecosystems with Australia's thriving startup and tech community."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Innovation Ecosystem
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Connect with Australia's vibrant innovation ecosystem. From startups to scale-ups, 
            research institutions to venture capital - we help you navigate and leverage the 
            entire Australian innovation landscape.
          </p>
          <Button size="lg" className="text-lg px-8 py-3">
            Explore Ecosystem
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {ecosystemFeatures.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ecosystem Overview */}
        <div className="bg-muted rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            Australia's Innovation Landscape
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Active Startups</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Innovation Hubs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$2B+</div>
              <p className="text-muted-foreground">Annual Investment</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card border rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Join Australia's Innovation Ecosystem?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let us connect you with the right partners, investors, and innovators 
            to accelerate your Australian market entry.
          </p>
          <div className="space-x-4">
            <Button size="lg">Get Connected</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InnovationEcosystem;
