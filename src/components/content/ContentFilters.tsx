
import { BookOpen, TrendingUp, Users, FileText, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const iconMap: Record<string, any> = {
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Play,
  Star
};

interface ContentFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLocation: string;
  selectedCategory: string | null;
  onLocationChange: (location: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  categories: any[];
  locations: string[];
}

export const ContentFilters = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  selectedCategory,
  onLocationChange,
  onCategoryChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  categories,
  locations
}: ContentFiltersProps) => {
  return (
    <>
      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search success stories..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div className="w-48">
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters Button */}
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Clear all filters link */}
          {hasActiveFilters && (
            <div className="mt-4">
              <button
                onClick={onClearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Expandable Filters */}
      {showFilters && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon] || BookOpen;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange(category.id)}
                    className="gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
};
