
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useRef } from "react";

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
  const statsRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(statsRef, { threshold: 0.1 });

  const providersCount = useCountUp({ end: serviceProviders.length, isVisible });
  const upcomingEvents = useCountUp({ end: events.length, isVisible });
  const availableLeads = useCountUp({ end: leads.length, isVisible });
  const expertMembers = useCountUp({ end: communityMembers.length, isVisible });
  const innovationPartners = useCountUp({ end: innovationEcosystem.length, isVisible });
  const tradePartners = useCountUp({ end: tradeAgencies.length, isVisible });
  const contentArticles = useCountUp({ end: contentItems.length, isVisible });

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
