import { Card, CardContent } from '@/components/ui/card';
import { Globe, Rocket } from 'lucide-react';
import type { Persona } from '@/contexts/PersonaContext';

interface PlannerStep1PersonaProps {
  onSelect: (persona: Persona) => void;
}

const options = [
  {
    value: 'international_entrant' as Persona,
    icon: Globe,
    title: "I'm expanding into Australia/NZ from overseas",
    description: "Market entry planning, entity setup, regulatory guidance, local partners, and go-to-market strategy.",
    color: "from-blue-500/10 to-primary/10",
    borderHover: "hover:border-blue-500/50",
  },
  {
    value: 'local_startup' as Persona,
    icon: Rocket,
    title: "I'm building or scaling a startup in Australia/NZ",
    description: "Growth planning, funding sources, accelerators, hiring, customer acquisition, and mentorship.",
    color: "from-emerald-500/10 to-accent/10",
    borderHover: "hover:border-emerald-500/50",
  },
];

export const PlannerStep1Persona = ({ onSelect }: PlannerStep1PersonaProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">What best describes you?</h2>
        <p className="text-muted-foreground">This helps us tailor your plan to your specific situation.</p>
      </div>

      <div className="grid gap-6">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="text-left w-full"
            >
              <Card
                className={`border-2 border-border/50 ${option.borderHover} transition-all duration-300 hover:shadow-lg cursor-pointer`}
              >
                <CardContent className="p-6 flex items-start gap-5">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
};
