import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface InvestorFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  uniqueStages: string[];
  uniqueSectors: string[];
}

const INVESTOR_TYPES = [
  { value: "all", label: "All" },
  { value: "vc", label: "VCs" },
  { value: "angel", label: "Angels & Syndicates" },
  { value: "venture_debt", label: "Venture Debt" },
  { value: "accelerator", label: "Accelerators" },
  { value: "grant", label: "Grants" },
  { value: "other", label: "Other" },
];

const InvestorFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedStage,
  setSelectedStage,
  selectedSector,
  setSelectedSector,
  uniqueStages,
  uniqueSectors,
}: InvestorFiltersProps) => {
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStage("all");
    setSelectedSector("all");
  };

  const hasActiveFilters = selectedType !== "all" || selectedStage !== "all" || selectedSector !== "all" || searchTerm !== "";

  return (
    <section className="bg-background border-b">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Type tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {INVESTOR_TYPES.map((type) => (
              <TabsTrigger key={type.value} value={type.value} className="text-sm">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search + dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search investors, sectors, or locations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {uniqueSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default InvestorFilters;
