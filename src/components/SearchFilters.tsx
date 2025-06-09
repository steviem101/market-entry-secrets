import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ServiceCategory {
  id: string;
  name: string;
  count: number;
  parentId?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  categories: ServiceCategory[];
  totalCount: number;
}

interface SearchFiltersProps {
  categories: ServiceCategory[];
  categoryGroups: CategoryGroup[];
  selectedCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchFilters = ({
  categories,
  categoryGroups,
  selectedCategories,
  onCategoryChange,
  searchTerm,
  onSearchChange,
}: SearchFiltersProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelected);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onSearchChange("");
  };

  const filteredGroups = categoryGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.categories.some(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !categoryGroups.some(group => 
      group.categories.some(groupCategory => groupCategory.id === category.id)
    )
  );

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
              const category = categories.find(c => c.id === categoryId) ||
                              categoryGroups.flatMap(g => g.categories).find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} variant="default">
                  {category.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {/* Grouped Categories */}
        {filteredGroups.map((group) => (
          <Collapsible
            key={group.id}
            open={expandedGroups.has(group.id)}
            onOpenChange={() => toggleGroup(group.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={group.categories.every(cat => selectedCategories.includes(cat.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newSelected = [...selectedCategories];
                        group.categories.forEach(cat => {
                          if (!newSelected.includes(cat.id)) {
                            newSelected.push(cat.id);
                          }
                        });
                        onCategoryChange(newSelected);
                      } else {
                        onCategoryChange(selectedCategories.filter(id => 
                          !group.categories.some(cat => cat.id === id)
                        ));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium text-left">{group.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {group.totalCount}
                  </span>
                  {expandedGroups.has(group.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-1 mt-1">
              {group.categories
                .filter(category => 
                  category.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((category) => (
                  <div key={category.id} className="flex items-center space-x-3 p-2 rounded hover:bg-accent/30 transition-colors">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={category.id}
                      className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </div>
                ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {/* Ungrouped Categories */}
        {filteredCategories.map((category) => (
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
