
import { MessageCircle, Send, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExpandedSearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  placeholder: string;
  onSubmit: (e: React.FormEvent) => void;
  onExpand: () => void;
  onToggleCollapse: () => void;
}

export const ExpandedSearchBar = ({
  query,
  setQuery,
  loading,
  placeholder,
  onSubmit,
  onExpand,
  onToggleCollapse
}: ExpandedSearchBarProps) => {
  return (
    <div className="relative">
      <div className="relative">
        <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onExpand}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
          className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm border-primary/20"
        />
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={!query.trim() || loading}
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex justify-end mt-2">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <ChevronDown className="w-3 h-3 mr-1" />
          Collapse
        </Button>
      </div>
    </div>
  );
};
