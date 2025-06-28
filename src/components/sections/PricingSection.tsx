
import { PricingCard } from "@/components/pricing/PricingCard";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const PricingSection = () => {
  const { user } = useAuth();

  const pricingTiers = [
    {
      id: 'free' as const,
      price: '$0',
      description: 'Perfect for exploring and sampling our ecosystem.',
      features: [
        'Service Providers Directory: Full access to 500+ providers (basic search only; no filters)',
        'Market-Entry Content: Download up to 3 content pieces (guides, interviews, case studies)',
        'Success-Story Library: Access 3 "lite" PDF stories',
        'Events & Community: RSVP to public meetups; join community channels',
        'Trade Agencies & Innovation Ecosystem: Browse directories, no saved views',
        'Market Entry Consultation: One 15-minute session',
        'Support: Community Slack support'
      ],
      cta: 'Get Started for Free',
      isPopular: false
    },
    {
      id: 'growth' as const,
      price: '$499',
      description: 'Ideal for small teams building their ANZ playbook.',
      features: [
        'Everything in Free, plus:',
        'Directory Filters & Saved Views: Drill into providers by sector, support type & role',
        'Unlimited Content & Stories: Full library access (video + transcripts)',
        'Events & Community: + 3 VIP seats per year for closed-door roundtables',
        'Mentor Sessions: 3 one-on-one meetings',
        'Sales Leads Database: 250 verified contacts (CSV export)',
        'AI-Powered Planner (Alpha Access): Early-invite to generate your own custom plan',
        'Data & Integrations: Export provider lists & lead databases (CSV)',
        'Support: Email support (48-hour SLA)'
      ],
      cta: 'Unlock Growth Access',
      isPopular: true
    },
    {
      id: 'scale' as const,
      price: '$1,999',
      description: 'Built for companies accelerating into ANZ with full guidance.',
      features: [
        'Everything in Growth, plus:',
        'Advanced Filters & Custom Views: Save unlimited filter sets',
        'Success-Story Walk-Throughs: Quarterly CSM-led deep dives',
        'Events & Community: Unlimited VIP seats + quarterly "Founders Council" invites',
        'Mentor Sessions: 5 one-on-one meetings with sector-specialist advisors',
        'Sales Leads Databases: 2×250 contacts (500 total)',
        'TAM Mapping Report: Detailed Total Addressable Market analysis',
        'Market Entry Strategy Report & Plan: Full, custom strategic blueprint',
        'AI-Powered Planner (Full Beta): Dedicated onboarding session',
        'Data & Integrations: One custom Zapier or API integration; unlimited CSV exports',
        'Support: Priority email support + monthly strategy calls with your CSM'
      ],
      cta: 'Access Scale Package',
      isPopular: false
    },
    {
      id: 'enterprise' as const,
      price: 'Custom Pricing',
      description: 'Your fully tailored market-entry blueprint, built around your exact needs.',
      features: [
        'Everything in Scale, plus:',
        'Dedicated account manager & SLA guarantees',
        'White-label, SSO & advanced API integrations',
        'On-demand workshops, deep-dive analysis, additional mentor support',
        'Custom data exports, bespoke reporting, and unlimited strategic calls'
      ],
      cta: 'Talk to Our Team',
      isPopular: false
    }
  ];

  const handleSelectTier = (tierId: string) => {
    // Handle tier selection based on tier type
    switch (tierId) {
      case 'free':
        // If user is already signed in, redirect to dashboard, otherwise to auth
        if (user) {
          window.location.href = '/dashboard';
          toast.success('Welcome! You already have free access.');
        } else {
          window.location.href = '/auth';
        }
        break;
      case 'growth':
      case 'scale':
        toast.info('Payment integration coming soon! Contact us for early access.', {
          description: 'We\'ll reach out within 24 hours to set up your plan.',
          duration: 5000,
        });
        // Optionally redirect to contact with pre-filled inquiry
        setTimeout(() => {
          window.location.href = '/contact';
        }, 2000);
        break;
      case 'enterprise':
        toast.success('Redirecting to contact our enterprise team...');
        setTimeout(() => {
          window.location.href = '/contact';
        }, 1000);
        break;
      default:
        toast.error('Unknown pricing tier selected');
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Market Entry</span> Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From free exploration to enterprise-grade support, find the perfect plan to accelerate your Australian market entry
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              onSelectTier={handleSelectTier}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            All plans include our core directories and community access. Upgrade or downgrade anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
