import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { InvestorsHero } from "@/components/investors/InvestorsHero";
import InvestorFilters from "@/components/investors/InvestorFilters";
import InvestorResults from "@/components/investors/InvestorResults";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { EnrichInvestorsButton } from "@/components/investors/EnrichInvestorsButton";
import { useInvestors } from "@/hooks/useInvestors";

const PAGE_SIZE = 12;

const Investors = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedStage, setSelectedStage] = useState<string>(searchParams.get("stage") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedStage !== "all") p.set("stage", selectedStage);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedType, selectedStage, selectedSector, currentPage, setSearchParams]);

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

  const totalPages = Math.ceil((filteredInvestors?.length || 0) / PAGE_SIZE);
  const paginatedInvestors = filteredInvestors?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStage("all");
    setSelectedSector("all");
    setCurrentPage(1);
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
          setSearchTerm={(v: string) => { setSearchTerm(v); setCurrentPage(1); }}
          selectedType={selectedType}
          setSelectedType={(v: string) => { setSelectedType(v); setCurrentPage(1); }}
          selectedStage={selectedStage}
          setSelectedStage={(v: string) => { setSelectedStage(v); setCurrentPage(1); }}
          selectedSector={selectedSector}
          setSelectedSector={(v: string) => { setSelectedSector(v); setCurrentPage(1); }}
          uniqueStages={uniqueStages}
          uniqueSectors={uniqueSectors}
        />

        <p className="text-muted-foreground text-sm mb-4">
          Showing {paginatedInvestors?.length || 0} of {filteredInvestors?.length || 0} investors
        </p>

        <InvestorResults
          filteredInvestors={paginatedInvestors}
          isLoading={isLoading}
          onClearFilters={clearAllFilters}
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Investors;
