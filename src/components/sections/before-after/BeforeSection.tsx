import { AlertTriangle } from "lucide-react";
import type { BeforeItem } from "@/config/personaContent";

interface BeforeSectionProps {
  heading: string;
  subheading: string;
  items: BeforeItem[];
}

export const BeforeSection = ({ heading, subheading, items }: BeforeSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left mb-8">
        <h3 className="text-2xl font-bold text-red-400 mb-2 flex items-center justify-center lg:justify-start gap-2">
          <AlertTriangle className="w-6 h-6" />
          {heading}
        </h3>
        <p className="text-muted-foreground">{subheading}</p>
      </div>

      <div className="grid gap-4">
        {items.map((item, index) => (
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
  );
};
