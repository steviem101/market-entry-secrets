import { Globe, Rocket } from "lucide-react";
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
    <div className="relative inline-flex bg-white/10 rounded-xl p-1 border border-white/15 backdrop-blur-sm">
      {/* Sliding background indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-white/20 rounded-lg transition-transform duration-300 ease-out ${
          activePersona === "startup" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />

      {toggleOptions.map((option) => {
        const Icon = option.icon;
        const isActive = activePersona === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-white" : "text-white/50 hover:text-white/70"
            }`}
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
