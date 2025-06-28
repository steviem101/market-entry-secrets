
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Users, 
  Database, 
  Map, 
  Calendar, 
  Building2,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  FileText,
  Phone,
  TrendingUp,
  CheckCircle,
  Zap
} from "lucide-react";

export const BeforeAfterSection = () => {
  const beforeItems = [
    {
      icon: Search,
      title: "Manual Research",
      description: "Months of Google searches and outdated reports",
      color: "text-red-400"
    },
    {
      icon: Phone,
      title: "Cold Outreach",
      description: "Random calls to unvetted service providers",
      color: "text-orange-400"
    },
    {
      icon: DollarSign,
      title: "Expensive Consulting",
      description: "$50K+ for basic market analysis and TAM reports",
      color: "text-red-400"
    },
    {
      icon: AlertTriangle,
      title: "Legal Risks",
      description: "Hiring untested lawyers, compliance mistakes",
      color: "text-orange-400"
    },
    {
      icon: Clock,
      title: "Regulatory Maze",
      description: "Complex compliance, missed requirements, delays",
      color: "text-red-400"
    },
    {
      icon: Target,
      title: "Random Networking",
      description: "Trial and error finding the right connections",
      color: "text-orange-400"
    },
    {
      icon: FileText,
      title: "Cultural Missteps",
      description: "Expensive mistakes from lack of local knowledge",
      color: "text-red-400"
    },
    {
      icon: TrendingUp,
      title: "Guesswork Strategy",
      description: "No proven playbook, making it up as you go",
      color: "text-orange-400"
    }
  ];

  const afterFeatures = [
    {
      icon: Building2,
      title: "500+ Vetted Service Providers",
      description: "Pre-screened legal, accounting, marketing partners",
      link: "/service-providers"
    },
    {
      icon: Users,
      title: "200+ Expert Mentors",
      description: "Advisors who've successfully entered Australian market",
      link: "/mentors"
    },
    {
      icon: Database,
      title: "100+ Premium Lead Lists",
      description: "Pre-qualified contact databases by industry/location",
      link: "/leads"
    },
    {
      icon: Map,
      title: "TAM Maps & Market Intelligence",
      description: "Real-time market sizing and opportunity analysis",
      link: "/leads"
    },
    {
      icon: Calendar,
      title: "50+ Monthly Events",
      description: "Networking and learning opportunities every month",
      link: "/events"
    },
    {
      icon: CheckCircle,
      title: "1,200+ Success Stories",
      description: "Proven case studies and lessons learned",
      link: "/case-studies"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop Wasting Time on{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Manual Market Entry
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how Market Entry Secrets transforms the complex, risky process of entering the Australian market into a streamlined, data-driven success story.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Before Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl font-bold text-red-400 mb-2 flex items-center justify-center lg:justify-start gap-2">
                <AlertTriangle className="w-6 h-6" />
                Before Market Entry Secrets
              </h3>
              <p className="text-muted-foreground">The painful traditional approach</p>
            </div>

            <div className="grid gap-4">
              {beforeItems.map((item, index) => (
                <div key={index} className="bg-background/60 backdrop-blur-sm border border-red-200/20 rounded-xl p-4 hover:border-red-300/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center lg:justify-start gap-2">
                <Zap className="w-6 h-6" />
                With Market Entry Secrets
              </h3>
              <p className="text-muted-foreground">Your streamlined path to success</p>
            </div>

            <div className="relative">
              {/* Central "WE TAKE CARE OF THAT" Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                  WE TAKE CARE OF THAT
                </div>
              </div>

              <div className="grid gap-4 pt-8">
                {afterFeatures.map((feature, index) => (
                  <Link key={index} to={feature.link} className="group">
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 hover:from-primary/10 hover:to-accent/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                          <feature.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Market Entry?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 1,200+ companies that chose the smart path to Australian market success with our proven resources and expert network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl"
            >
              <Link to="/service-providers">
                Start Your Market Entry
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-4 text-lg rounded-xl"
            >
              <Link to="/case-studies">
                View Success Stories
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
