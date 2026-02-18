
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
  UserCheck,
  Sparkles,
  Landmark
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Ecosystem navigation items
export const ecosystemNavItems: NavItem[] = [
  { label: "Innovation Ecosystem", href: "/innovation-ecosystem", icon: Lightbulb },
  { label: "Investors", href: "/investors", icon: Landmark },
  { label: "Trade & Investment", href: "/trade-investment-agencies", icon: TrendingUp },
  { label: "Service Providers", href: "/service-providers", icon: Users },
  { label: "Mentors", href: "/community", icon: UserCheck },
];

// Content navigation items
export const contentNavItems: NavItem[] = [
  { label: "Market Entry Guides", href: "/content", icon: FileText },
  { label: "Market Entry Case Studies", href: "/case-studies", icon: BookOpen },
];

// Primary navigation items (main nav links)
export const primaryNavItems: NavItem[] = [
  { label: "Report Creator", href: "/report-creator", icon: Sparkles },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Leads", href: "/leads", icon: Target },
];

// Popular navigation items
export const popularNavItems: NavItem[] = [
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Countries", href: "/countries", icon: Globe },
  { label: "Sectors", href: "/sectors", icon: Building2 },
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
  ...contentNavItems,
  ...ecosystemNavItems,
  ...popularNavItems,
  ...infoNavItems,
];
