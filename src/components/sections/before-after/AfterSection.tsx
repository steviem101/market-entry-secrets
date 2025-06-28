
import { Link } from "react-router-dom";
import { 
  Building2,
  Users, 
  Database, 
  Map, 
  Calendar, 
  CheckCircle,
  Zap
} from "lucide-react";

export const AfterSection = () => {
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
  );
};
