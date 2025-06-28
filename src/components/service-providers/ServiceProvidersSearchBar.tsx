
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";

interface ServiceProvidersSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

export const ServiceProvidersSearchBar = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearAllFilters
}: ServiceProvidersSearchBarProps) => {
  return (
    <div className="flex gap-4 items-center">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search organizations, services, or locations..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggleFilters}
        className="gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
      </Button>

      {/* Clear Filters Button - Only show when filters are active */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onClearAllFilters}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
          Clear all
        </Button>
      )}
    </div>
  );
};
