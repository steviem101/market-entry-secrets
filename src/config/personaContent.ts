import type { LucideIcon } from "lucide-react";
import {
  Search,
  Phone,
  DollarSign,
  Target,
  FileText,
  TrendingUp,
  Building2,
  Users,
  Database,
  Map,
  Calendar,
  CheckCircle,
  Globe,
  Puzzle,
  Lightbulb,
  Rocket,
  CircleDollarSign,
  UserX,
  Layers,
  Clock,
  BarChart3,
} from "lucide-react";

export type SectionPersona = "international" | "startup";

// ---------------------------------------------------------------------------
// Before / After
// ---------------------------------------------------------------------------

export interface BeforeItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface AfterItem {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
}

export interface BeforeAfterContent {
  sectionTitle: string;
  sectionSubtitle: string;
  beforeHeading: string;
  beforeSubheading: string;
  beforeItems: BeforeItem[];
  afterHeading: string;
  afterSubheading: string;
  afterItems: AfterItem[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchContent {
  badge: string;
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
}

// ---------------------------------------------------------------------------
// Value / Features
// ---------------------------------------------------------------------------

export interface ValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  color: string;
  href: string;
}

export interface ValueContent {
  sectionTitle: string;
  sectionSubtitle: string;
  items: ValueItem[];
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  company: string;
  country_flag: string;
  country_name: string;
  testimonial: string;
  outcome: string;
  avatar?: string;
  is_featured: boolean;
  sort_order: number;
}

export interface TestimonialsContent {
  heading: string;
  headingAccent: string;
  subtitle: string;
  socialProof: string;
  fallbackTestimonials: TestimonialItem[];
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface PricingTierContent {
  id: 'free' | 'growth' | 'scale' | 'enterprise';
  price: string;
  description: string;
  features: string[];
  cta: string;
  isPopular: boolean;
}

export interface PricingContent {
  heading: string;
  headingAccent: string;
  subtitle: string;
  tiers: PricingTierContent[];
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------

export interface CTAContent {
  headingAccent: string;
  headingPlain: string;
  subtitle: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
}

// ---------------------------------------------------------------------------
// Floating CTA
// ---------------------------------------------------------------------------

export interface FloatingCTAContent {
  label: string;
  shortLabel: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Full persona config
// ---------------------------------------------------------------------------

export interface PersonaSectionContent {
  beforeAfter: BeforeAfterContent;
  search: SearchContent;
  value: ValueContent;
  testimonials: TestimonialsContent;
  pricing: PricingContent;
  cta: CTAContent;
  floatingCTA: FloatingCTAContent;
}

// ===========================================================================
// Journey A — International Market Entrant
// ===========================================================================

const internationalContent: PersonaSectionContent = {
  beforeAfter: {
    sectionTitle: "Before vs. After Market Entry",
    sectionSubtitle:
      "See the dramatic difference between entering the ANZ market blind and having the right intelligence at your fingertips",
    beforeHeading: "Before Market Entry Secrets",
    beforeSubheading: "The painful way companies enter Australia",
    beforeItems: [
      {
        icon: Search,
        title: "Manual Research",
        description:
          "Months of Google searches and outdated reports that barely scratch the surface",
        color: "text-red-400",
      },
      {
        icon: Phone,
        title: "Cold Outreach",
        description:
          "Spray and pray to unvetted service providers, advisors and partners",
        color: "text-orange-400",
      },
      {
        icon: DollarSign,
        title: "Expensive Consultants",
        description:
          "$000's for generic market analysis reports that tell you what you already know",
        color: "text-red-400",
      },
      {
        icon: Target,
        title: "Random Networking",
        description:
          "Trial and error finding the right connections at overseas conferences",
        color: "text-orange-400",
      },
      {
        icon: FileText,
        title: "Cultural Missteps",
        description:
          "Expensive mistakes from lack of local knowledge and regulatory blind spots",
        color: "text-red-400",
      },
      {
        icon: TrendingUp,
        title: "Guesswork Strategy",
        description:
          "No proven playbook — making it up as you go with no local benchmarks",
        color: "text-orange-400",
      },
    ],
    afterHeading: "With Market Entry Secrets",
    afterSubheading: "Your streamlined path to ANZ market success",
    afterItems: [
      {
        icon: Building2,
        title: "120+ Vetted Service Providers",
        description:
          "Pre-screened legal, accounting, and business setup partners across ANZ",
        link: "/service-providers",
      },
      {
        icon: Users,
        title: "200+ Expert Mentors",
        description:
          "Advisors who've successfully entered the Australian market from abroad",
        link: "/mentors",
      },
      {
        icon: Database,
        title: "100+ Premium Lead Lists",
        description:
          "Pre-qualified contact databases segmented by industry and location",
        link: "/leads",
      },
      {
        icon: Map,
        title: "TAM Maps & Market Intelligence",
        description:
          "Real-time market sizing and opportunity analysis for your sector",
        link: "/leads",
      },
      {
        icon: Calendar,
        title: "50+ Monthly Events",
        description:
          "Networking and learning opportunities with ANZ decision-makers",
        link: "/events",
      },
      {
        icon: CheckCircle,
        title: "1,200+ Success Stories",
        description:
          "Proven case studies from companies that made the same move you're making",
        link: "/case-studies",
      },
      {
        icon: FileText,
        title: "Custom AI Report in Minutes",
        description:
          "A tailored market entry plan with SWOT, competitor analysis, and provider matches — not months of consultant time",
        link: "/report-creator?persona=international",
      },
    ],
  },

  search: {
    badge: "AI-Powered Market Intelligence",
    headingLine1: "Search 2,000+ Verified Data Points",
    headingLine2: "Curated by AI + Human Experts",
    subtitle:
      "Search vetted providers, industry experts, events, and market insights — all verified and continuously updated to accelerate your Australian market entry.",
  },

  value: {
    sectionTitle: "Intelligence, Not Just a Directory",
    sectionSubtitle:
      "Stop juggling multiple platforms and outdated spreadsheets. Get AI-matched providers, real-time market data, and a custom report — what takes consultants months, delivered in minutes.",
    items: [
      {
        icon: Building2,
        title: "Market Entry Specialists",
        description:
          "Pre-screened legal, accounting, and business setup providers who specialise in helping foreign companies establish in ANZ",
        badge: "120+ Entry Specialists",
        color: "text-blue-600",
        href: "/service-providers",
      },
      {
        icon: Users,
        title: "Cross-Border Mentors",
        description:
          "Advisors who've successfully navigated the same market entry journey from your region to Australia",
        badge: "200+ Mentors",
        color: "text-green-600",
        href: "/mentors",
      },
      {
        icon: Target,
        title: "ANZ Buyer Databases",
        description:
          "Pre-qualified contact databases of Australian customers and channel partners in your target sector",
        badge: "1,200+ Contacts",
        color: "text-purple-600",
        href: "/leads",
      },
      {
        icon: Calendar,
        title: "Trade & Networking Events",
        description:
          "Trade shows, expos, and bilateral business events relevant to international market entry",
        badge: "50+ Monthly",
        color: "text-orange-600",
        href: "/events",
      },
      {
        icon: FileText,
        title: "Market Entry Playbooks",
        description:
          "Step-by-step guides, case studies, and regulatory checklists from companies that made the move",
        badge: "100+ Guides",
        color: "text-indigo-600",
        href: "/content",
      },
      {
        icon: Globe,
        title: "Trade & Government Support",
        description:
          "Connect with Austrade, trade agencies, and government programs that actively support foreign entrants",
        badge: "25+ Agencies",
        color: "text-teal-600",
        href: "/innovation-ecosystem",
      },
    ],
  },

  testimonials: {
    heading: "Join Companies That ",
    headingAccent: "Chose Success",
    subtitle:
      "See how international businesses transformed their market entry with our proven resources",
    socialProof: "Trusted by teams from 12+ countries",
    fallbackTestimonials: [
      {
        id: "fallback-int-1",
        name: "Sarah Chen",
        title: "CEO",
        company: "US SaaS Company",
        country_flag: "\u{1F1FA}\u{1F1F8}",
        country_name: "United States",
        testimonial:
          "Market Entry Secrets cut our Australian market research time from 6 months to 2 weeks. The vetted service providers were exactly what we needed to set up operations in Sydney.",
        outcome: "Launched in Sydney 89% faster than projected",
        avatar: undefined,
        is_featured: true,
        sort_order: 1,
      },
      {
        id: "fallback-int-2",
        name: "Marcus Weber",
        title: "Founder",
        company: "German Manufacturing Firm",
        country_flag: "\u{1F1E9}\u{1F1EA}",
        country_name: "Germany",
        testimonial:
          "The mentor network was invaluable. Speaking with someone who had already navigated German-to-Australian expansion saved us countless regulatory mistakes.",
        outcome: "Avoided $50K+ in compliance mistakes",
        avatar: undefined,
        is_featured: true,
        sort_order: 2,
      },
      {
        id: "fallback-int-3",
        name: "Priya Patel",
        title: "Head of Expansion",
        company: "Indian Digital Agency",
        country_flag: "\u{1F1EE}\u{1F1F3}",
        country_name: "India",
        testimonial:
          "The lead databases were incredibly targeted. We closed our first Australian client within 30 days of launch using their premium lists.",
        outcome: "First client signed in 30 days",
        avatar: undefined,
        is_featured: true,
        sort_order: 3,
      },
    ],
  },

  pricing: {
    heading: "Choose Your ",
    headingAccent: "Market Entry",
    subtitle:
      "From free exploration to enterprise-grade support, find the perfect plan to accelerate your Australian market entry",
    tiers: [
      {
        id: 'free',
        price: '$0',
        description: 'Explore the ANZ ecosystem and see what\'s possible.',
        features: [
          'Browse 500+ service providers, mentors, and trade agencies',
          'Explore innovation hubs, events, and location guides',
          'Read sample case studies and market-entry content',
          'AI-powered market-entry report and planner (summary + action plan)',
          'Browse trade agencies and innovation directories',
          'Contact us for questions',
        ],
        cta: 'Start Exploring Free',
        isPopular: false,
      },
      {
        id: 'growth',
        price: '$99',
        description: 'For teams building their Australian market-entry playbook.',
        features: [
          'Everything in Free, plus:',
          'Full AI report: SWOT, competitor landscape, and mentor matches',
          'Unlimited case studies and market-entry guides',
          'Browse and download lead sample packs',
          'AI-matched mentor and advisor recommendations',
          'Priority email support',
        ],
        cta: 'Unlock Market Entry',
        isPopular: true,
      },
      {
        id: 'scale',
        price: '$999',
        description: 'Full-stack market intelligence for companies entering ANZ.',
        features: [
          'Everything in Growth, plus:',
          'Full AI report with curated lead list and investor recommendations',
          'Access the complete leads and TAM maps marketplace',
          'AI-powered tools with deep competitor and end-buyer research',
          'Personalised onboarding via our support team',
          'Quarterly market intelligence updates',
        ],
        cta: 'Accelerate Your Entry',
        isPopular: false,
      },
      {
        id: 'enterprise',
        price: 'Custom Pricing',
        description: 'Your fully tailored market-entry program, built around your needs.',
        features: [
          'Everything in Scale, plus:',
          'Custom AI reports with bespoke research parameters',
          'Dedicated account manager',
          'Multiple team seats with shared dashboards',
          'Priority partner and provider introductions',
          'Custom data exports and integrations',
        ],
        cta: 'Talk to Our Team',
        isPopular: false,
      },
    ],
  },

  cta: {
    headingAccent: "Ready to Enter",
    headingPlain: "the Australian Market?",
    subtitle:
      "Generate a tailored market entry plan in minutes — backed by 500+ vetted providers and real market intelligence.",
    primaryCTA: {
      label: "Create My Market Entry Report",
      href: "/report-creator?persona=international",
    },
    secondaryCTA: { label: "Schedule Consultation", href: "/contact" },
  },

  floatingCTA: {
    label: "Start My Report",
    shortLabel: "Report",
    href: "/report-creator?persona=international",
  },
};

// ===========================================================================
// Journey B — Australian Startup Founder
// ===========================================================================

const startupContent: PersonaSectionContent = {
  beforeAfter: {
    sectionTitle: "Before vs. After Your Growth Stack",
    sectionSubtitle:
      "See the difference between navigating the Aussie ecosystem alone and having curated intelligence at your fingertips",
    beforeHeading: "Before Market Entry Secrets",
    beforeSubheading: "The fragmented founder experience",
    beforeItems: [
      {
        icon: Puzzle,
        title: "Fragmented Ecosystem",
        description:
          "Spending weeks piecing together which accelerators, grants, and advisors actually matter",
        color: "text-red-400",
      },
      {
        icon: UserX,
        title: "Wrong Advisors",
        description:
          "Paying for mentors and consultants who don't understand your stage or vertical",
        color: "text-orange-400",
      },
      {
        icon: CircleDollarSign,
        title: "Funding Black Holes",
        description:
          "Applying to grants and VCs with no data on who funds your type of startup",
        color: "text-red-400",
      },
      {
        icon: Layers,
        title: "Tool Overload",
        description:
          "Juggling 10 different platforms for leads, events, legal help, and market data",
        color: "text-orange-400",
      },
      {
        icon: Clock,
        title: "Slow Decision-Making",
        description:
          "No benchmarks, no comparables — every strategic choice feels like a coin flip",
        color: "text-red-400",
      },
      {
        icon: BarChart3,
        title: "Growth Guesswork",
        description:
          "Scaling customer acquisition without real market sizing or sector insights",
        color: "text-orange-400",
      },
    ],
    afterHeading: "With Market Entry Secrets",
    afterSubheading: "Your curated local growth stack",
    afterItems: [
      {
        icon: Building2,
        title: "120+ Vetted Service Providers",
        description:
          "Pre-screened legal, accounting, and growth partners who work with startups",
        link: "/service-providers",
      },
      {
        icon: Users,
        title: "200+ Expert Mentors",
        description:
          "Founders, operators, and investors who've scaled companies just like yours",
        link: "/mentors",
      },
      {
        icon: Rocket,
        title: "Accelerators & Funding Intel",
        description:
          "Curated list of VCs, grants, and accelerators filtered by stage and sector",
        link: "/innovation-ecosystem",
      },
      {
        icon: Database,
        title: "100+ Premium Lead Lists",
        description:
          "Pre-qualified prospect databases to fuel your outbound pipeline",
        link: "/leads",
      },
      {
        icon: Calendar,
        title: "50+ Monthly Events",
        description:
          "Founder meetups, pitch nights, and industry networking across Australia",
        link: "/events",
      },
      {
        icon: Lightbulb,
        title: "Growth Playbooks & Case Studies",
        description:
          "Learn from Aussie founders who've been where you are right now",
        link: "/case-studies",
      },
      {
        icon: FileText,
        title: "Custom AI Growth Plan in Minutes",
        description:
          "A tailored growth report with SWOT, investor matches, and go-to-market strategy — not months of guesswork",
        link: "/report-creator?persona=startup",
      },
    ],
  },

  search: {
    badge: "AI-Powered Growth Engine",
    headingLine1: "Search 2,000+ Verified Resources",
    headingLine2: "Curated for Australian Founders",
    subtitle:
      "Search advisors, funding sources, service providers, and growth resources — all verified and continuously updated for Australian startups.",
  },

  value: {
    sectionTitle: "Intelligence-Driven Growth, Not Guesswork",
    sectionSubtitle:
      "Stop wasting time stitching together scattered resources. Get AI-matched advisors, real market data, and a custom growth plan — what takes months of research, delivered in minutes.",
    items: [
      {
        icon: Building2,
        title: "Startup-Stage Providers",
        description:
          "Legal, accounting, and growth partners who understand startup pace, budget, and equity-friendly terms",
        badge: "300+ Startup-Friendly",
        color: "text-blue-600",
        href: "/service-providers",
      },
      {
        icon: Users,
        title: "Founder Mentors & Operators",
        description:
          "Operators and investors who've scaled Australian startups — matched to your stage and sector",
        badge: "200+ Mentors",
        color: "text-green-600",
        href: "/mentors",
      },
      {
        icon: Target,
        title: "Sales-Ready Prospect Lists",
        description:
          "Pre-qualified lead databases to jumpstart your outbound sales engine — segmented by industry",
        badge: "1,200+ Prospects",
        color: "text-purple-600",
        href: "/leads",
      },
      {
        icon: Calendar,
        title: "Pitch Nights & Demo Days",
        description:
          "Pitch nights, demo days, and investor meetups curated for founders at your stage",
        badge: "50+ Monthly",
        color: "text-orange-600",
        href: "/events",
      },
      {
        icon: FileText,
        title: "Founder Growth Playbooks",
        description:
          "Step-by-step guides and case studies from founders who've scaled in the Australian market",
        badge: "100+ Playbooks",
        color: "text-indigo-600",
        href: "/content",
      },
      {
        icon: Rocket,
        title: "Investors & Accelerators",
        description:
          "VCs, grants, accelerators, and incubators filtered by stage, sector, and location",
        badge: "25+ Programs",
        color: "text-teal-600",
        href: "/innovation-ecosystem",
      },
    ],
  },

  testimonials: {
    heading: "Founders Who ",
    headingAccent: "Scaled Smarter",
    subtitle:
      "See how Australian startup founders accelerated their growth with our curated resources",
    socialProof: "Trusted by 180+ Australian founders",
    fallbackTestimonials: [
      {
        id: "fallback-su-1",
        name: "Jake Morrison",
        title: "Co-founder & CEO",
        company: "PayRight",
        country_flag: "\u{1F1E6}\u{1F1FA}",
        country_name: "Australia",
        testimonial:
          "We were drowning in disconnected tools and outdated advisor lists. MES gave us a curated growth stack — the right mentors, the right events, and a lead database that actually converted.",
        outcome: "Series A closed 3 months ahead of schedule",
        avatar: undefined,
        is_featured: true,
        sort_order: 1,
      },
      {
        id: "fallback-su-2",
        name: "Mei Lin Tan",
        title: "Founder",
        company: "GreenLoop",
        country_flag: "\u{1F1E6}\u{1F1FA}",
        country_name: "Australia",
        testimonial:
          "As a first-time founder, I had no idea which accelerators were worth applying to. MES matched me with the right program and two mentors who completely changed my fundraising strategy.",
        outcome: "Accepted into Startmate + raised $1.2M pre-seed",
        avatar: undefined,
        is_featured: true,
        sort_order: 2,
      },
      {
        id: "fallback-su-3",
        name: "Tom Nguyen",
        title: "CTO",
        company: "DataPilot",
        country_flag: "\u{1F1E6}\u{1F1FA}",
        country_name: "Australia",
        testimonial:
          "The service provider directory saved us weeks of vetting. We found a startup-savvy legal team and an accountant who understood R&D tax incentives on day one.",
        outcome: "Saved $30K+ in first-year legal and accounting costs",
        avatar: undefined,
        is_featured: true,
        sort_order: 3,
      },
    ],
  },

  pricing: {
    heading: "Choose Your ",
    headingAccent: "Growth",
    subtitle:
      "From free exploration to full-stack support, pick the plan that matches your startup stage",
    tiers: [
      {
        id: 'free',
        price: '$0',
        description: 'Discover the ecosystem and find your growth path.',
        features: [
          'Browse innovation hubs, trade agencies, and ecosystem directories',
          'Discover events, meetups, and accelerator programs',
          'Read sample founder case studies and growth content',
          'AI-powered growth report and planner (summary + action plan)',
          'Browse trade agencies and innovation directories',
          'Contact us for questions',
        ],
        cta: 'Start Exploring Free',
        isPopular: false,
      },
      {
        id: 'growth',
        price: '$99',
        description: 'For founders building partnerships and go-to-market plans.',
        features: [
          'Everything in Free, plus:',
          'Full AI report: SWOT, competitor landscape, and advisor matches',
          'Unlimited case studies and growth guides',
          'Browse and download lead sample packs',
          'AI-matched advisor and mentor recommendations',
          'Priority email support',
        ],
        cta: 'Unlock Growth Access',
        isPopular: true,
      },
      {
        id: 'scale',
        price: '$999',
        description: 'Full-stack growth intelligence for scaling startups.',
        features: [
          'Everything in Growth, plus:',
          'Full AI report with investor recommendations and curated lead list',
          'Access the complete leads and TAM maps marketplace',
          'AI-powered tools with deep market and partner research',
          'Curated investor and partner introductions',
          'Personalised growth support via our team',
        ],
        cta: 'Scale Your Startup',
        isPopular: false,
      },
      {
        id: 'enterprise',
        price: 'Custom Pricing',
        description: 'Bespoke growth support, built around your startup.',
        features: [
          'Everything in Scale, plus:',
          'Custom AI reports with bespoke research scope',
          'Dedicated growth advisor',
          'Multiple team seats with shared dashboards',
          'Inbound international partner pipeline curation',
          'Custom data exports and integrations',
        ],
        cta: 'Talk to Our Team',
        isPopular: false,
      },
    ],
  },

  cta: {
    headingAccent: "Ready to Scale",
    headingPlain: "Your Startup Faster?",
    subtitle:
      "Generate a tailored growth plan in minutes — with curated mentors, funding intel, and the tools founders actually need.",
    primaryCTA: {
      label: "Create My Growth Report",
      href: "/report-creator?persona=startup",
    },
    secondaryCTA: { label: "Find a Mentor", href: "/mentors" },
  },

  floatingCTA: {
    label: "Growth Report",
    shortLabel: "Report",
    href: "/report-creator?persona=startup",
  },
};

// ===========================================================================
// Accessor
// ===========================================================================

export const PERSONA_CONTENT: Record<SectionPersona, PersonaSectionContent> = {
  international: internationalContent,
  startup: startupContent,
};

