import { PricingFeatureRow } from "./PricingFeatureRow";

export const PricingTableBody = () => {
  const features = [
    {
      name: "Service Providers Directory",
      starter: "Basic search only",
      growth: "Full filters & saved views",
      enterprise: "Advanced filters & custom views"
    },
    {
      name: "Market-Entry Content Downloads",
      starter: "3 pieces",
      growth: "Unlimited",
      enterprise: "Unlimited"
    },
    {
      name: "Success-Story Library",
      starter: "3 lite PDFs",
      growth: "Full library + video",
      enterprise: "Full library + video + walk-throughs"
    },
    {
      name: "Events & Community Access",
      starter: true,
      growth: "3 VIP seats/year",
      enterprise: "Unlimited VIP seats"
    },
    {
      name: "Trade Agencies & Innovation Ecosystem",
      starter: "Browse only",
      growth: true,
      enterprise: true
    },
    {
      name: "Market Entry Consultation",
      starter: "15-min session",
      growth: "3 one-on-one meetings",
      enterprise: "5 one-on-one meetings"
    },
    {
      name: "Sales Leads Database",
      starter: false,
      growth: "250 contacts",
      enterprise: "500 contacts"
    },
    {
      name: "AI-Powered Planner",
      starter: false,
      growth: "Alpha Access",
      enterprise: true
    },
    {
      name: "Data Exports (CSV)",
      starter: false,
      growth: true,
      enterprise: true
    },
    {
      name: "TAM Mapping Report",
      starter: false,
      growth: false,
      enterprise: true
    },
    {
      name: "Market Entry Strategy Report",
      starter: false,
      growth: false,
      enterprise: true
    },
    {
      name: "Dedicated Account Manager",
      starter: false,
      growth: false,
      enterprise: true
    },
    {
      name: "White-label & SSO Integration",
      starter: false,
      growth: false,
      enterprise: true
    },
    {
      name: "Support",
      starter: "Community Slack",
      growth: "Email (48h SLA)",
      enterprise: "Priority + SLA guarantees"
    }
  ];

  return (
    <div>
      {features.map((feature, index) => (
        <PricingFeatureRow
          key={index}
          feature={feature}
          isEven={index % 2 === 0}
        />
      ))}
    </div>
  );
};
