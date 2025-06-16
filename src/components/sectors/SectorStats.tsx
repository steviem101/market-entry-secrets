
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface SectorStatsProps {
  serviceProviders: any[];
  events: any[];
  leads: any[];
  communityMembers: any[];
  innovationEcosystem: any[];
  tradeAgencies: any[];
  contentItems: any[];
}

const SectorStats = ({
  serviceProviders,
  events,
  leads,
  communityMembers,
  innovationEcosystem,
  tradeAgencies,
  contentItems
}: SectorStatsProps) => {
  const { elementRef: statsRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  // Use consistent hook calling order by calculating all counts first
  const serviceProviderCount = serviceProviders.length;
  const eventCount = events.length;
  const leadCount = leads.length;
  const communityMemberCount = communityMembers.length;
  const innovationEcosystemCount = innovationEcosystem.length;
  const tradeAgencyCount = tradeAgencies.length;
  const contentItemCount = contentItems.length;

  // Now call all hooks in consistent order
  const providersCount = useCountUp({ end: serviceProviderCount, isVisible, duration: 2000 });
  const upcomingEvents = useCountUp({ end: eventCount, isVisible, duration: 2200 });
  const availableLeads = useCountUp({ end: leadCount, isVisible, duration: 2400 });
  const expertMembers = useCountUp({ end: communityMemberCount, isVisible, duration: 2600 });
  const innovationPartners = useCountUp({ end: innovationEcosystemCount, isVisible, duration: 2800 });
  const tradePartners = useCountUp({ end: tradeAgencyCount, isVisible, duration: 3000 });
  const contentArticles = useCountUp({ end: contentItemCount, isVisible, duration: 3200 });

  const stats = [
    { 
      label: "Service Providers", 
      value: providersCount,
      description: "Specialized companies"
    },
    { 
      label: "Innovation Partners", 
      value: innovationPartners,
      description: "Ecosystem entities"
    },
    { 
      label: "Trade Agencies", 
      value: tradePartners,
      description: "Investment agencies"
    },
    { 
      label: "Content Articles", 
      value: contentArticles,
      description: "Industry insights"
    },
    { 
      label: "Upcoming Events", 
      value: upcomingEvents,
      description: "Industry gatherings"
    },
    { 
      label: "Market Data", 
      value: availableLeads,
      description: "Available datasets"
    },
    { 
      label: "Industry Experts", 
      value: expertMembers,
      description: "Available mentors"
    }
  ];

  console.log('SectorStats render:', { isVisible, stats: stats.map(s => ({ label: s.label, value: s.value })) });

  return (
    <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SectorStats;
