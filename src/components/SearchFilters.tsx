
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ServiceCategory {
  id: string;
  name: string;
  count: number;
}

interface SearchFiltersProps {
  categories: ServiceCategory[];
  selectedCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchFilters = ({
  categories,
  selectedCategories,
  onCategoryChange,
  searchTerm,
  onSearchChange,
}: SearchFiltersProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelected);
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onSearchChange("");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Explore by Service Category</h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Type & Search category here..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Active Filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} variant="default" className="bg-teal-600">
                  {category.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {categories
          .filter(category => 
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((category) => (
            <div key={category.id} className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 transition-colors">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <label
                htmlFor={category.id}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.name}
              </label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {category.count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchFilters;
