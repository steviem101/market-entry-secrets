import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Database,
  Users,
  Building2,
  Rocket,
  Calendar,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useHeroStats } from "@/hooks/useHeroStats";
import { HERO_PERSONA_STATS } from "./heroContent";
import type { HeroPersona, HeroStatKey } from "./heroContent";

const STAT_ICONS: Record<HeroStatKey, LucideIcon> = {
  investors: TrendingUp,
  leads: Database,
  mentors: Users,
  serviceProviders: Building2,
  accelerators: Rocket,
  events: Calendar,
  guides: BookOpen,
};

const ICON_COLORS: Record<HeroStatKey, string> = {
  investors: "from-emerald-500/20 to-emerald-400/10 text-emerald-500",
  leads: "from-blue-500/20 to-blue-400/10 text-blue-500",
  mentors: "from-violet-500/20 to-violet-400/10 text-violet-500",
  serviceProviders: "from-primary/20 to-accent/10 text-primary",
  accelerators: "from-orange-500/20 to-orange-400/10 text-orange-500",
  events: "from-rose-500/20 to-rose-400/10 text-rose-500",
  guides: "from-amber-500/20 to-amber-400/10 text-amber-500",
};

// Map from stat key to the field in the hook's return data
const DB_KEY_MAP: Record<HeroStatKey, string> = {
  investors: "investors",
  leads: "leads",
  mentors: "communityMembers",
  serviceProviders: "serviceProviders",
  accelerators: "accelerators",
  events: "events",
  guides: "guides",
};

interface StatCardProps {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  href: string;
  isVisible: boolean;
  delay: number;
  animationKey: string;
}

const StatCard = ({
  value,
  suffix,
  label,
  icon: Icon,
  iconColor,
  href,
  isVisible,
  delay,
  animationKey,
}: StatCardProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [animationKey, delay]);

  const count = useAnimatedCounter(value, 2000, isVisible && show);

  return (
    <Link
      to={href}
      className={`group relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl
        bg-card/60 backdrop-blur-sm border border-border/50
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
        hover:scale-[1.03] transition-all duration-300 cursor-pointer
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center
          bg-gradient-to-br ${iconColor} animate-hero-stat-breathe`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Number */}
      <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
        {count}
        <span className="text-primary/70">{suffix}</span>
      </div>

      {/* Label */}
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider text-center leading-tight">
        {label}
      </div>

      {/* Hover arrow hint */}
      <span
        className="absolute bottom-1.5 right-2 text-xs text-primary opacity-0
          group-hover:opacity-100 transition-opacity duration-200"
      >
        &rarr;
      </span>
    </Link>
  );
};

interface HeroStatsRowProps {
  isVisible: boolean;
  activePersona: HeroPersona;
}

const StatSkeleton = () => (
  <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50">
    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
    <div className="w-12 h-7 bg-muted rounded animate-pulse" />
    <div className="w-16 h-3 bg-muted/70 rounded animate-pulse" />
  </div>
);

export const HeroStatsRow = ({ isVisible, activePersona }: HeroStatsRowProps) => {
  const { data: dbCounts, isLoading } = useHeroStats();
  const stats = HERO_PERSONA_STATS[activePersona];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <StatSkeleton key={`skeleton-${stat.key}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => {
        const dbField = DB_KEY_MAP[stat.key];
        const liveValue =
          dbCounts && dbCounts[dbField as keyof typeof dbCounts]
            ? dbCounts[dbField as keyof typeof dbCounts]
            : stat.fallback;

        return (
          <StatCard
            key={`${activePersona}-${stat.key}`}
            value={liveValue}
            suffix={stat.suffix}
            label={stat.label}
            icon={STAT_ICONS[stat.key]}
            iconColor={ICON_COLORS[stat.key]}
            href={stat.href}
            isVisible={isVisible}
            delay={i * 80}
            animationKey={activePersona}
          />
        );
      })}
    </div>
  );
};
