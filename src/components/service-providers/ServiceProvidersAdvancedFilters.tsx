import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceProviderCategories } from "@/hooks/useServiceProviders";

interface ServiceProvidersAdvancedFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  services: string[];
  onServiceClick: (service: string) => void;
}

export const ServiceProvidersAdvancedFilters = ({
  selectedCategory,
  onCategoryChange,
  verifiedOnly,
  onVerifiedChange,
  sortBy,
  onSortChange,
  services,
  onServiceClick,
}: ServiceProvidersAdvancedFiltersProps) => {
  const { data: categories = [] } = useServiceProviderCategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Category:</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured first</SelectItem>
              <SelectItem value="name">A-Z</SelectItem>
              <SelectItem value="views">Most viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verified Only Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="verified-only"
            checked={verifiedOnly}
            onCheckedChange={onVerifiedChange}
          />
          <Label htmlFor="verified-only" className="text-sm text-muted-foreground cursor-pointer">
            Verified only
          </Label>
        </div>
      </div>

      {/* Quick service pills */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Services:</span>
          {services.slice(0, 10).map((service) => (
            <button
              key={service}
              className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
              onClick={() => onServiceClick(service)}
            >
              {service}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
