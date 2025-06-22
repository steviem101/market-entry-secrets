import { FileText, Calendar, Building2, Globe, Users, Network, Database } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof FileText;
}

// Primary navigation items (always visible on desktop)
export const primaryNavItems: NavItem[] = [
  { href: "/content", label: "Content", icon: FileText },
  { href: "/leads", label: "Leads", icon: Database },
  { href: "/events", label: "Events", icon: Calendar },
];

// Ecosystem dropdown items
export const ecosystemNavItems: NavItem[] = [
  { href: "/service-providers", label: "Service Providers", icon: Building2 },
  { href: "/trade-investment-agencies", label: "Trade & Investment", icon: Building2 },
  { href: "/innovation-ecosystem", label: "Innovation Ecosystem", icon: Network },
  { href: "/mentors", label: "Mentors", icon: Users },
];

// Popular dropdown items
export const popularNavItems: NavItem[] = [
  { href: "/sectors", label: "Sectors", icon: TrendingUp },
  { href: "/countries", label: "Countries", icon: Globe },
];

// Secondary navigation items (remaining items for mobile)
export const secondaryNavItems: NavItem[] = [
  // Events moved back to primary navigation
];

// Footer/info items (in dropdown on desktop)
export const infoNavItems: NavItem[] = [
  { href: "/about", label: "About", icon: FileText },
  { href: "/contact", label: "Contact", icon: FileText },
  { href: "/faq", label: "FAQ", icon: FileText },
];

// All items for mobile menu
export const allNavItems: NavItem[] = [
  ...primaryNavItems,
  ...ecosystemNavItems,
  ...popularNavItems,
  ...secondaryNavItems,
  ...infoNavItems,
];
