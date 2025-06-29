
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, Calendar, Target, Globe } from "lucide-react";

const valueItems = [
  {
    icon: Building2,
    title: "Vetted Service Providers",
    description: "Access pre-screened legal, accounting, and business setup providers",
    badge: "500+ Providers",
    color: "text-blue-600"
  },
  {
    icon: Users,
    title: "Expert Mentors",
    description: "Connect with founders who've successfully entered the Australian market",
    badge: "200+ Mentors",
    color: "text-green-600"
  },
  {
    icon: Target,
    title: "Qualified Leads",
    description: "Access databases of potential customers and business opportunities",
    badge: "1,200+ Leads",
    color: "text-purple-600"
  },
  {
    icon: Calendar,
    title: "Industry Events",
    description: "Discover networking events, conferences, and trade shows",
    badge: "50+ Events",
    color: "text-orange-600"
  },
  {
    icon: FileText,
    title: "Market Intelligence",
    description: "Get detailed case studies, guides, and market entry strategies",
    badge: "100+ Resources",
    color: "text-indigo-600"
  },
  {
    icon: Globe,
    title: "Innovation Ecosystem",
    description: "Connect with accelerators, incubators, and government agencies",
    badge: "25+ Hubs",
    color: "text-teal-600"
  }
];

export const ValueSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stop juggling multiple platforms and endless research. Get instant access to our comprehensive ecosystem of vetted resources and proven strategies.
            </p>
          </div>

          {/* Value Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueItems.map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {item.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
