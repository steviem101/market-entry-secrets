import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { TradeInvestmentAgenciesHero } from "@/components/trade-investment-agencies/TradeInvestmentAgenciesHero";
import TradeInvestmentAgenciesFilters from "@/components/trade-investment-agencies/TradeInvestmentAgenciesFilters";
import TradeInvestmentAgenciesResults from "@/components/trade-investment-agencies/TradeInvestmentAgenciesResults";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { useTradeAgencies, useOrganisationCategories } from "@/hooks/useTradeAgencies";

const PAGE_SIZE = 12;

const TradeInvestmentAgencies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (selectedLocation !== "all") p.set("location", selectedLocation);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedCategory !== "all") p.set("category", selectedCategory);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedLocation, selectedSector, selectedType, selectedCategory, currentPage, setSearchParams]);

  const { data: agencies, isLoading, error } = useTradeAgencies();
  const { data: categories = [] } = useOrganisationCategories();

  const filteredAgencies = agencies?.filter(agency => {
    const a = agency as any;
    const matchesSearch = searchTerm === "" ||
      agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.tagline && a.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || agency.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    const normalise = (v: string) => v.replace(/_/g, ' ').toLowerCase();
    const matchesSector = selectedSector === "all" ||
      (a.sectors_supported && (
        a.sectors_supported.includes('all') ||
        a.sectors_supported.some((s: string) => normalise(s) === selectedSector.toLowerCase())
      ));
    const matchesType = selectedType === "all" ||
      (a.organisation_type && normalise(a.organisation_type) === selectedType.toLowerCase());
    const matchesCategory = selectedCategory === "all" ||
      (a.category_slug && a.category_slug === selectedCategory);
    return matchesSearch && matchesLocation && matchesSector && matchesType && matchesCategory;
  }) || [];

  const totalPages = Math.ceil(filteredAgencies.length / PAGE_SIZE);
  const paginatedAgencies = filteredAgencies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const uniqueLocations = [...new Set(agencies?.map(agency => agency.location) || [])];
  const uniqueSectors = [...new Set(
    agencies?.flatMap(agency => (agency as any).sectors_supported || [])
      .filter((s: string) => s && s !== 'all') || []
  )];
  const uniqueTypes = [...new Set(
    agencies?.map(agency => (agency as any).organisation_type)
      .filter(Boolean) || []
  )];

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSelectedType("all");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading organisations: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Government & Industry Support | Market Entry Secrets</title>
        <meta
          name="description"
          content="Connect with government agencies, industry associations, chambers of commerce, and bilateral trade organisations supporting international business expansion into Australia and New Zealand."
        />
        <meta property="og:title" content="Government & Industry Support | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Connect with government agencies, industry associations, and chambers supporting market entry into Australia and New Zealand."
        />
        <link rel="canonical" href={`${window.location.origin}/government-support`} />
      </Helmet>

      <TradeInvestmentAgenciesHero
        agencyCount={agencies?.length || 0}
        locationCount={uniqueLocations.length}
        categories={categories}
        agencies={agencies || []}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <TradeInvestmentAgenciesFilters
          searchTerm={searchTerm}
          setSearchTerm={(v: string) => { setSearchTerm(v); setCurrentPage(1); }}
          selectedLocation={selectedLocation}
          setSelectedLocation={(v: string) => { setSelectedLocation(v); setCurrentPage(1); }}
          selectedSector={selectedSector}
          setSelectedSector={(v: string) => { setSelectedSector(v); setCurrentPage(1); }}
          selectedType={selectedType}
          setSelectedType={(v: string) => { setSelectedType(v); setCurrentPage(1); }}
          selectedCategory={selectedCategory}
          setSelectedCategory={(v: string) => { setSelectedCategory(v); setCurrentPage(1); }}
          uniqueLocations={uniqueLocations as string[]}
          uniqueSectors={uniqueSectors as string[]}
          uniqueTypes={uniqueTypes as string[]}
          categories={categories}
        />

        <p className="text-muted-foreground text-sm mb-4">
          Showing {paginatedAgencies.length} of {filteredAgencies.length} organisations
        </p>

        <TradeInvestmentAgenciesResults
          filteredAgencies={paginatedAgencies}
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

export default TradeInvestmentAgencies;
