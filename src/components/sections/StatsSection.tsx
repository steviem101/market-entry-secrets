
import { Link } from "react-router-dom";
import { Users, Building2, TrendingUp, Calendar, Award, Rocket } from "lucide-react";

export const StatsSection = () => {
  const featuredStats = [
    { icon: Building2, label: "Service Providers", value: "500+", link: "/service-providers" },
    { icon: Users, label: "Success Stories", value: "1,200+", link: "/mentors" },
    { icon: TrendingUp, label: "Market Entry Rate", value: "94%", link: "/about" },
    { icon: Calendar, label: "Monthly Events", value: "50+", link: "/events" },
    { icon: Award, label: "Expert Mentors", value: "200+", link: "/mentors" },
    { icon: Rocket, label: "Innovation Hubs", value: "25+", link: "/innovation-ecosystem" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
      {featuredStats.map((stat, index) => (
        <Link key={index} to={stat.link} className="group">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
              <stat.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};
