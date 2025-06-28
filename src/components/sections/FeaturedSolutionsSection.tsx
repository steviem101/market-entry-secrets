
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Database, 
  Map, 
  Calendar, 
  Rocket,
  ArrowRight
} from "lucide-react";

export const FeaturedSolutionsSection = () => {
  const solutions = [
    {
      icon: Building2,
      title: "Vetted Service Providers",
      description: "500+ pre-screened legal, accounting, and marketing partners ready to help you succeed",
      count: "500+",
      link: "/service-providers",
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600"
    },
    {
      icon: Users,
      title: "Expert Mentors",
      description: "Get guidance from 200+ advisors who've successfully entered the Australian market",
      count: "200+",
      link: "/mentors",
      color: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-600"
    },
    {
      icon: Database,
      title: "Premium Lead Lists",
      description: "Access 100+ curated contact databases segmented by industry and location",
      count: "100+",
      link: "/leads",
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600"
    },
    {
      icon: Map,
      title: "TAM Maps & Intelligence",
      description: "Real-time market sizing and opportunity analysis for strategic planning",
      count: "Live Data",
      link: "/leads",
      color: "from-orange-500/10 to-orange-600/10",
      iconColor: "text-orange-600"
    },
    {
      icon: Calendar,
      title: "Networking Events",
      description: "50+ monthly events to connect with industry leaders and potential partners",
      count: "50+/mo",
      link: "/events",
      color: "from-pink-500/10 to-pink-600/10",
      iconColor: "text-pink-600"
    },
    {
      icon: Rocket,
      title: "Innovation Ecosystem",
      description: "Connect with 25+ accelerators, incubators, and innovation hubs",
      count: "25+",
      link: "/innovation-ecosystem",
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/2 to-accent/3" />
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Succeed in Australia
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access our comprehensive ecosystem of vetted resources, expert guidance, and proven strategies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <Link key={index} to={solution.link} className="group">
              <div className={`relative h-full p-6 rounded-2xl bg-gradient-to-br ${solution.color} border border-border/20 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm`}>
                    <solution.icon className={`w-5 h-5 ${solution.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${solution.iconColor}`}>
                      {solution.count}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                  {solution.description}
                </p>
                
                <div className="flex items-center text-primary group-hover:text-accent transition-colors">
                  <span className="font-medium text-sm">Explore</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl"
          >
            <Link to="/service-providers">
              Explore All Resources
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
