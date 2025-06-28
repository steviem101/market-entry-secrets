import { 
  Network, 
  Users, 
  Calendar, 
  FileText, 
  MapPin, 
  Globe, 
  Building2, 
  Lightbulb, 
  TrendingUp,
  MessageSquare,
  Target,
  BookOpen,
  Phone,
  HelpCircle,
  Info,
  UserCheck
} from "lucide-react";
import { Home } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Ecosystem navigation items
export const ecosystemNavItems: NavItem[] = [
  { label: "Innovation Ecosystem", href: "/innovation-ecosystem", icon: Lightbulb },
  { label: "Trade & Investment", href: "/trade-investment-agencies", icon: TrendingUp },
  { label: "Service Providers", href: "/service-providers", icon: Users },
  { label: "Mentors", href: "/community", icon: UserCheck },
];

// Primary navigation items (main nav links)
export const primaryNavItems: NavItem[] = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Leads", href: "/leads", icon: Target },
];

// Popular navigation items
export const popularNavItems: NavItem[] = [
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Countries", href: "/countries", icon: Globe },
  { label: "Sectors", href: "/sectors", icon: Building2 },
  { label: "Case Studies", href: "/case-studies", icon: BookOpen },
];

// Info navigation items
export const infoNavItems: NavItem[] = [
  { label: "About", href: "/about", icon: Info },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Contact", href: "/contact", icon: Phone },
];

// All navigation items combined (for mobile)
export const allNavItems: NavItem[] = [
  ...primaryNavItems,
  ...ecosystemNavItems,
  ...popularNavItems,
  ...infoNavItems,
];

// Legacy export for backward compatibility
export const navigationItems = [
  {
    title: "Browse",
    items: [
      { name: "Events", href: "/events" },
      { name: "Content", href: "/content" },
      { name: "Leads", href: "/leads" },
    ]
  },
  {
    title: "Ecosystem",
    items: [
      { name: "Innovation Ecosystem", href: "/innovation-ecosystem" },
      { name: "Trade & Investment", href: "/trade-investment-agencies" },
      { name: "Service Providers", href: "/service-providers" },
      { name: "Mentors", href: "/community" },
    ]
  },
  {
    title: "Popular",
    items: [
      { name: "Locations", href: "/locations" },
      { name: "Countries", href: "/countries" },
      { name: "Sectors", href: "/sectors" },
      { name: "Case Studies", href: "/case-studies" },
    ]
  },
  {
    title: "Info",
    items: [
      { name: "About", href: "/about" },
      { name: "FAQ", href: "/faq" },
      { name: "Contact", href: "/contact" },
    ]
  }
];

export const getAuthenticatedNavigationItems = (isAdmin: boolean, isModerator: boolean) => {
  const items = [...navigationItems];
  
  // Add Member Hub as the first item for authenticated users
  items.unshift({
    name: "Member Hub",
    href: "/hub",
    icon: Home,
  });

  return items;
};
