import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import type { AfterItem } from "@/config/personaContent";

interface AfterSectionProps {
  heading: string;
  subheading: string;
  items: AfterItem[];
}

export const AfterSection = ({ heading, subheading, items }: AfterSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left mb-8">
        <h3 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center lg:justify-start gap-2">
          <Zap className="w-6 h-6" />
          {heading}
        </h3>
        <p className="text-muted-foreground">{subheading}</p>
      </div>

      <div className="grid gap-4">
        {items.map((feature, index) => (
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
  );
};
