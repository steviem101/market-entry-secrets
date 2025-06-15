
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Lead } from "@/pages/Leads";

interface LeadFiltersProps {
  leads: Lead[];
  selectedType: string;
  selectedCategory: string;
  selectedIndustry: string;
  selectedLocation: string;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onReset: () => void;
}

export const LeadFilters = ({
  leads,
  selectedType,
  selectedCategory,
  selectedIndustry,
  selectedLocation,
  onTypeChange,
  onCategoryChange,
  onIndustryChange,
  onLocationChange,
  onReset,
}: LeadFiltersProps) => {
  // Extract unique values for filter options
  const types = Array.from(new Set(leads.map(lead => lead.type)));
  const categories = Array.from(new Set(leads.map(lead => lead.category)));
  const industries = Array.from(new Set(leads.map(lead => lead.industry)));
  const locations = Array.from(new Set(leads.map(lead => lead.location)));

  const activeFiltersCount = [selectedType, selectedCategory, selectedIndustry, selectedLocation]
    .filter(filter => filter !== "all").length;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'csv_list':
        return 'Lead Databases';
      case 'tam_map':
        return 'TAM Maps';
      default:
        return type;
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Filters</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Type</label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Industry</label>
          <Select value={selectedIndustry} onValueChange={onIndustryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Location</label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
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
      </div>
    </div>
  );
};
