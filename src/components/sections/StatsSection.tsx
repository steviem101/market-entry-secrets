
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
    <section className="relative py-20 section-fade">
      <div className="absolute inset-0 gradient-section" />
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {featuredStats.map((stat, index) => (
            <Link key={index} to={stat.link} className="group">
              <div className="text-center p-6 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/30 hover:bg-background/60 hover:border-primary/20 transition-all duration-500 soft-shadow hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <stat.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
