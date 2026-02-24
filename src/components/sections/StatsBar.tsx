import { Building2, Calendar, FileText, Briefcase, Globe } from "lucide-react";

const stats = [
  { icon: Building2, label: "Vetted providers", value: "500+" },
  { icon: Calendar, label: "Monthly events", value: "50+" },
  { icon: FileText, label: "Market reports", value: "37" },
  { icon: Briefcase, label: "Sectors covered", value: "8" },
  { icon: Globe, label: "Countries tracked", value: "5" },
];

export const StatsBar = () => {
  return (
    <section className="py-12 border-y border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 text-center">
                <Icon className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground ml-1.5">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
