import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { InvestorsHero } from "@/components/investors/InvestorsHero";
import InvestorFilters from "@/components/investors/InvestorFilters";
import InvestorResults from "@/components/investors/InvestorResults";
import { UsageBanner } from "@/components/UsageBanner";
import { EnrichInvestorsButton } from "@/components/investors/EnrichInvestorsButton";
import { useInvestors } from "@/hooks/useInvestors";

const Investors = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") ?? "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: investors, isLoading, error } = useInvestors();

  const filteredInvestors = investors?.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.sector_focus?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || inv.investor_type === selectedType;
    const matchesStage = selectedStage === "all" || inv.stage_focus?.includes(selectedStage);
    const matchesSector = selectedSector === "all" || inv.sector_focus?.includes(selectedSector);
    return matchesSearch && matchesType && matchesStage && matchesSector;
  });

  const uniqueStages = useMemo(
    () => [...new Set(investors?.flatMap(inv => inv.stage_focus || []) || [])].sort(),
    [investors]
  );

  const uniqueSectors = useMemo(
    () => [...new Set(investors?.flatMap(inv => inv.sector_focus || []) || [])].sort(),
    [investors]
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    investors?.forEach(inv => {
      counts[inv.investor_type] = (counts[inv.investor_type] || 0) + 1;
    });
    return counts;
  }, [investors]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStage("all");
    setSelectedSector("all");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading investors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Australian Investors | Market Entry Secrets</title>
        <meta
          name="description"
          content="Find Australian venture capital firms, angel investors, accelerators, grants, and venture debt providers for your market entry."
        />
        <meta property="og:title" content="Australian Investors | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Discover VCs, angels, accelerators, grants, and venture debt providers in Australia."
        />
        <link rel="canonical" href="https://market-entry-secrets.lovable.app/investors" />
      </Helmet>

      <InvestorsHero
        investorCount={investors?.length || 0}
        typeCounts={typeCounts}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <UsageBanner />
          <EnrichInvestorsButton
            investors={investors || []}
            onEnrichmentComplete={() => queryClient.invalidateQueries({ queryKey: ['investors'] })}
          />
        </div>

        <InvestorFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          uniqueStages={uniqueStages}
          uniqueSectors={uniqueSectors}
        />

        <InvestorResults
          filteredInvestors={filteredInvestors}
          isLoading={isLoading}
          onClearFilters={clearAllFilters}
        />
      </div>
    </>
  );
};

export default Investors;
