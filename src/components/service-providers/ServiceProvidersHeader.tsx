
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface ServiceProvidersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filteredCount: number;
}

export const ServiceProvidersHeader = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filteredCount
}: ServiceProvidersHeaderProps) => {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Providers</h1>
            <p className="text-muted-foreground">
              {filteredCount} service providers found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search providers..." 
                value={searchTerm} 
                onChange={e => onSearchChange(e.target.value)} 
                className="pl-10 w-64" 
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
