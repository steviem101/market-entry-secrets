
import SearchFilters from "@/components/SearchFilters";

interface ServiceProvidersFiltersProps {
  categories: Array<{ id: string; name: string; count: number }>;
  categoryGroups: Array<{
    id: string;
    name: string;
    totalCount: number;
    categories: Array<{ id: string; name: string; count: number }>;
  }>;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  showFilters: boolean;
}

export const ServiceProvidersFilters = ({
  categories,
  categoryGroups,
  selectedCategories,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  selectedLocations,
  onLocationChange,
  showFilters
}: ServiceProvidersFiltersProps) => {
  return (
    <aside className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
      <SearchFilters
        categories={categories}
        categoryGroups={categoryGroups}
        selectedCategories={selectedCategories}
        onCategoryChange={onCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedLocations={selectedLocations}
        onLocationChange={onLocationChange}
      />
    </aside>
  );
};
