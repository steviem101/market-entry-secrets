
import {
  Users,
  Calendar,
  FileText,
  MapPin,
  Globe,
  Building2,
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
  UserCheck,
  Landmark,
  Compass
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

// Directory navigation items (was "Ecosystem")
export const directoryNavItems: NavItem[] = [
  { label: "Service Providers", href: "/service-providers", icon: Users, description: "Vetted advisors & consultants" },
  { label: "Mentors & Advisors", href: "/mentors", icon: UserCheck, description: "Founders who've done it before" },
  { label: "Investors", href: "/investors", icon: Landmark, description: "VCs, angels & funding sources" },
  { label: "Innovation Hubs", href: "/innovation-ecosystem", icon: Lightbulb, description: "Incubators & accelerators" },
  { label: "Trade Agencies", href: "/trade-investment-agencies", icon: TrendingUp, description: "Government trade support" },
];

// Explore navigation items (was "Popular")
export const exploreNavItems: NavItem[] = [
  { label: "By Location", href: "/locations", icon: MapPin, description: "Australian cities & regions" },
  { label: "By Country", href: "/countries", icon: Globe, description: "Source country market guides" },
  { label: "By Sector", href: "/sectors", icon: Building2, description: "Industry-specific intelligence" },
];

// Core navigation items (standalone links — Events + Leads)
export const coreNavItems: NavItem[] = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Leads", href: "/leads", icon: Target },
];

// Resources navigation items (was "Content")
export const resourcesNavItems: NavItem[] = [
  { label: "Market Entry Guides", href: "/content", icon: FileText, description: "Step-by-step entry playbooks" },
  { label: "Case Studies", href: "/case-studies", icon: BookOpen, description: "Real company success stories" },
];

// Dropdown trigger configs
export const dropdownTriggers = {
  directory: { label: "Directory", icon: Building2 },
  explore: { label: "Explore", icon: Compass },
  resources: { label: "Resources", icon: BookOpen },
} as const;

// Mobile navigation groups
export const mobileNavGroups: NavGroup[] = [
  { label: "Directory", items: directoryNavItems },
  { label: "Explore", items: exploreNavItems },
  { label: null, items: coreNavItems },
  { label: "Resources", items: resourcesNavItems },
];
