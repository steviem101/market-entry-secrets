
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

interface SearchInputProps {
  searchQuery: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  searchQuery,
  placeholder,
  onSearchChange,
  onClear,
  onFocus,
  onKeyDown
}, ref) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-full"
      />
      {searchQuery ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-accent/50"
        >
          <X className="w-4 h-4" />
        </Button>
      ) : null}
    </div>
  );
});

SearchInput.displayName = "SearchInput";
