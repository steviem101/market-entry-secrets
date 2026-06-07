/**
 * Maps the prototype's icon names (used by GOALS[].icon, GOAL_CATEGORIES,
 * PERSONA_COPY, etc.) to lucide-react components. Production uses lucide-react,
 * not the prototype's inlined SVG paths (per the handoff guardrails).
 */
import {
  Globe, Rocket, Building2, Users, Coins, BookOpen, Shield, Settings,
  Briefcase, Landmark, Calendar, Compass, Target, Check, ArrowRight, ArrowLeft,
  Sparkles, Search, X, Plus, Pencil, ChevronDown, Clock, Swords, Lock, MapPin,
  Link2, Lightbulb, Zap, type LucideIcon,
} from 'lucide-react';

const REGISTRY: Record<string, LucideIcon> = {
  globe: Globe,
  rocket: Rocket,
  building: Building2,
  users: Users,
  coins: Coins,
  book: BookOpen,
  shield: Shield,
  settings: Settings,
  briefcase: Briefcase,
  landmark: Landmark,
  calendar: Calendar,
  compass: Compass,
  target: Target,
  check: Check,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  sparkles: Sparkles,
  search: Search,
  x: X,
  plus: Plus,
  pencil: Pencil,
  chevronDown: ChevronDown,
  clock: Clock,
  swords: Swords,
  lock: Lock,
  mapPin: MapPin,
  link: Link2,
  lightbulb: Lightbulb,
  zap: Zap,
};

export function iconComponent(name: string): LucideIcon {
  return REGISTRY[name] ?? Sparkles;
}

interface RcIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

/** Render a prototype-named icon via lucide-react. */
export function RcIcon({ name, size = 20, className, strokeWidth = 1.75, ...rest }: RcIconProps) {
  const Cmp = iconComponent(name);
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
