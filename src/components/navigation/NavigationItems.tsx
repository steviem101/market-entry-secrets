
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
  Info
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Ecosystem navigation items
export const ecosystemNavItems: NavItem[] = [
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Countries", href: "/countries", icon: Globe },
  { label: "Sectors", href: "/sectors", icon: Building2 },
  { label: "Innovation Ecosystem", href: "/innovation-ecosystem", icon: Lightbulb },
  { label: "Trade & Investment", href: "/trade-investment-agencies", icon: TrendingUp },
];

// Primary navigation items (main nav links)
export const primaryNavItems: NavItem[] = [
  { label: "Service Providers", href: "/service-providers", icon: Users },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Community", href: "/community", icon: MessageSquare },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Leads", href: "/leads", icon: Target },
];

// Popular navigation items
export const popularNavItems: NavItem[] = [
  { label: "Case Studies", href: "/case-studies", icon: BookOpen },
  { label: "Innovation Ecosystem", href: "/innovation-ecosystem", icon: Lightbulb },
  { label: "Trade & Investment", href: "/trade-investment-agencies", icon: TrendingUp },
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
  ...infoNavItems,
];

// Legacy export for backward compatibility
export const navigationItems = [
  {
    title: "Browse",
    items: [
      { name: "Service Providers", href: "/service-providers" },
      { name: "Events", href: "/events" },
      { name: "Content", href: "/content" },
      { name: "Community", href: "/community" },
      { name: "Leads", href: "/leads" },
    ]
  },
  {
    title: "Explore",
    items: [
      { name: "Locations", href: "/locations" },
      { name: "Countries", href: "/countries" },
      { name: "Sectors", href: "/sectors" },
      { name: "Innovation Ecosystem", href: "/innovation-ecosystem" },
      { name: "Trade & Investment", href: "/trade-investment-agencies" },
    ]
  },
  {
    title: "Resources",
    items: [
      { name: "Case Studies", href: "/case-studies" },
      { name: "About", href: "/about" },
      { name: "FAQ", href: "/faq" },
      { name: "Contact", href: "/contact" },
    ]
  }
];
