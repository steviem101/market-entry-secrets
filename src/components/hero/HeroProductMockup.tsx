import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Building2,
  ClipboardList,
  Star,
  Clock,
  TrendingUp,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { HERO_PERSONAS } from "./heroContent";
import type { HeroPersona } from "./heroContent";

interface HeroProductMockupProps {
  persona: HeroPersona;
}

// --- Mockup view: Report Preview ---
const ReportPreview = ({ persona }: { persona: HeroPersona }) => {
  const scenario = HERO_PERSONAS[persona].mockupScenario;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            Executive Summary
          </div>
          <div className="text-xs text-muted-foreground">
            {scenario.companyName} &mdash; {scenario.industry}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 border border-border">
        <div className="space-y-2">
          <div className="h-2.5 bg-muted rounded-full w-full" />
          <div className="h-2.5 bg-muted/70 rounded-full w-11/12" />
          <div className="h-2.5 bg-muted/70 rounded-full w-4/5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Market Size", value: "$4.2B" },
          { label: "Growth Rate", value: "12.5%" },
          { label: "Entry Cost", value: "$45K" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-muted/30 rounded-lg p-2 border border-border text-center"
          >
            <div className="text-xs text-muted-foreground">{metric.label}</div>
            <div className="text-sm font-bold text-primary">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>
          Report generated &mdash; {persona === "international" ? "12" : "8"}{" "}
          sections
        </span>
      </div>
    </div>
  );
};

// --- Mockup view: Provider Matches ---
const ProviderMatches = ({ persona }: { persona: HeroPersona }) => {
  const providers =
    persona === "international"
      ? [
          {
            name: "Austrade Connect",
            location: "Sydney",
            match: 97,
            services: ["Market Entry", "Regulation"],
          },
          {
            name: "ANZ Legal Partners",
            location: "Melbourne",
            match: 94,
            services: ["Compliance", "Entity Setup"],
          },
          {
            name: "Pacific Growth Advisory",
            location: "Brisbane",
            match: 91,
            services: ["Strategy", "Local Partners"],
          },
        ]
      : [
          {
            name: "LaunchPad Accelerator",
            location: "Sydney",
            match: 96,
            services: ["Funding", "Mentorship"],
          },
          {
            name: "Scale Capital Partners",
            location: "Melbourne",
            match: 93,
            services: ["Series A", "Growth"],
          },
          {
            name: "Startup Melbourne Hub",
            location: "Melbourne",
            match: 89,
            services: ["Networking", "Talent"],
          },
        ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-primary/30 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            Matched Providers
          </div>
          <div className="text-xs text-muted-foreground">
            3 of 12 top matches shown
          </div>
        </div>
      </div>

      {providers.map((provider) => (
        <div
          key={provider.name}
          className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {provider.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {provider.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {provider.location}
              <span className="mx-1">&middot;</span>
              {provider.services.join(", ")}
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-500 shrink-0">
            {provider.match}%
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Mockup view: Intake Form ---
const IntakePreview = ({ persona }: { persona: HeroPersona }) => {
  const scenario = HERO_PERSONAS[persona].mockupScenario;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-primary/30 flex items-center justify-center">
          <ClipboardList className="w-4 h-4 text-violet-500" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            Your Details
          </div>
          <div className="text-xs text-muted-foreground">Step 1 of 3</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full w-1/3 transition-all duration-500" />
      </div>

      {/* Form fields */}
      <div className="space-y-2.5">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Company Name</div>
          <div className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground/80">
            {scenario.companyName}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Country of Origin</div>
          <div className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground/80">
            {scenario.country}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Industry Sector</div>
          <div className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground/80">
            {scenario.industry}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Target Region</div>
          <div className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground/80">
            {scenario.targetRegion}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View definitions ---
const VIEWS = [
  { key: "report", component: ReportPreview },
  { key: "providers", component: ProviderMatches },
  { key: "intake", component: IntakePreview },
] as const;

// --- Main mockup component ---
export const HeroProductMockup = ({ persona }: HeroProductMockupProps) => {
  const [activeView, setActiveView] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Centralized transition helper — clears any in-flight timeout first
  const startTransition = useCallback((onComplete: () => void) => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    setIsTransitioning(true);
    transitionTimerRef.current = setTimeout(() => {
      onComplete();
      setIsTransitioning(false);
    }, 200);
  }, []);

  const cycleView = useCallback(() => {
    startTransition(() => {
      setActiveView((prev) => (prev + 1) % VIEWS.length);
    });
  }, [startTransition]);

  // Auto-cycle every 4 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(cycleView, 4000);
    return () => clearInterval(interval);
  }, [isPaused, cycleView]);

  // Reset view on persona change
  useEffect(() => {
    startTransition(() => {
      setActiveView(0);
    });
  }, [persona, startTransition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const ActiveComponent = VIEWS[activeView].component;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Glow effect behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl rounded-3xl animate-glow" />

      {/* Browser frame */}
      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
          <div className="flex-1 mx-4">
            <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
              market-entry-secrets.com/report
            </div>
          </div>
        </div>

        {/* Content area */}
        <div
          className={`p-5 min-h-[320px] transition-all duration-200 ${
            isTransitioning
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          }`}
        >
          <ActiveComponent persona={persona} />
        </div>

        {/* View indicator dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {VIEWS.map((view, i) => (
            <button
              key={view.key}
              onClick={() => {
                startTransition(() => {
                  setActiveView(i);
                });
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeView
                  ? "bg-primary w-6"
                  : "bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating accent badges */}
      <div
        className="absolute -top-3 right-2 lg:-right-3 bg-background/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md animate-float z-20"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-foreground">97% match</span>
        </div>
      </div>

      <div
        className="absolute -bottom-2 left-2 lg:-left-3 bg-background/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md animate-float z-20"
        style={{ animationDelay: "2s" }}
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Report in 3 min
          </span>
        </div>
      </div>

      <div
        className="absolute top-1/2 -right-4 bg-background/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md animate-float z-20 hidden lg:block"
        style={{ animationDelay: "3.5s" }}
      >
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-foreground">4.9/5</span>
        </div>
      </div>
    </div>
  );
};
