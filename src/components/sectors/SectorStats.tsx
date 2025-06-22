
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
  const stats = [
    {
      label: "Service Providers",
      value: serviceProviders.length,
      color: "text-blue-600"
    },
    {
      label: "Events",
      value: events.length,
      color: "text-green-600"
    },
    {
      label: "Market Data",
      value: leads.length,
      color: "text-purple-600"
    },
    {
      label: "Community Members",
      value: communityMembers.length,
      color: "text-orange-600"
    },
    {
      label: "Innovation Partners",
      value: innovationEcosystem.length,
      color: "text-teal-600"
    },
    {
      label: "Trade Agencies",
      value: tradeAgencies.length,
      color: "text-red-600"
    },
    {
      label: "Content Items",
      value: contentItems.length,
      color: "text-indigo-600"
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Sector Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-4 bg-card rounded-lg border">
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SectorStats;
