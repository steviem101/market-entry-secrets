
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface EventSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
}

export const EventSearch = ({ onSearch, onClear, isSearching }: EventSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Auto-filter as user types
    if (value.trim()) {
      onSearch(value.trim());
    } else {
      onClear();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onClear();
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events by title, description, or location..."
          value={searchQuery}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      {isSearching && (
        <Button variant="outline" onClick={handleClear}>
          Clear All
        </Button>
      )}
    </div>
  );
};
