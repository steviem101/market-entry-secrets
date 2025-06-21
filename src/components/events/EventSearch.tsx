
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface EventSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
}

export const EventSearch = ({ searchQuery, onSearchChange, isSearching }: EventSearchProps) => {
  const handleSearch = () => {
    onSearchChange(searchQuery.trim());
  };

  const handleClear = () => {
    onSearchChange("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events by title, description, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
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
      <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
      {isSearching && (
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  );
};
