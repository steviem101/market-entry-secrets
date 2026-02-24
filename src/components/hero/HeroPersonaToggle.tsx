import { Globe, Rocket } from "lucide-react";
import { HERO_PERSONAS } from "./heroContent";
import type { HeroPersona } from "./heroContent";

interface HeroPersonaToggleProps {
  activePersona: HeroPersona;
  onChange: (persona: HeroPersona) => void;
}

const toggleOptions = [
  { key: "international" as const, icon: Globe, label: "International Entry" },
  { key: "startup" as const, icon: Rocket, label: "Startup Growth" },
];

export const HeroPersonaToggle = ({
  activePersona,
  onChange,
}: HeroPersonaToggleProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-3">
        Choose your journey
      </p>
      <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Choose your journey">
        {toggleOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activePersona === option.key;
          const content = HERO_PERSONAS[option.key];
          return (
            <button
              key={option.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.key)}
              className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                isActive
                  ? "bg-background shadow-lg border-primary/30 ring-2 ring-primary/20 scale-[1.02]"
                  : "bg-muted/50 border-border opacity-70 hover:opacity-90 hover:border-primary/20"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-primary/20 to-accent/20"
                    : "bg-muted"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div
                  className={`text-base font-semibold transition-colors duration-300 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {content.toggleDescription}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
