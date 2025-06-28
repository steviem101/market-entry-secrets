
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

// Navigation structure for dropdowns - no Member Hub here
export const navigationItems = [
  {
    name: "Browse",
    subItems: primaryNavItems,
    icon: FileText,
  },
  {
    name: "Ecosystem", 
    subItems: ecosystemNavItems,
    icon: Network,
  },
  {
    name: "Popular",
    subItems: popularNavItems,
    icon: TrendingUp,
  },
  {
    name: "Info",
    subItems: infoNavItems,
    icon: Info,
  }
];

// Same navigation for both authenticated and non-authenticated users
export const getAuthenticatedNavigationItems = (isAdmin: boolean, isModerator: boolean) => {
  return navigationItems;
};
