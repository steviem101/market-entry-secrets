
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
    <div className="bg-background/95 backdrop-blur-sm rounded-xl border shadow-lg p-4">
      <div className="relative mb-3">
        <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onExpand}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
          className="pl-12 pr-12 py-3 text-base rounded-lg border-2 border-border focus:border-primary transition-colors"
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
      <div className="flex justify-end">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="h-7 px-3 text-xs"
        >
          <ChevronDown className="w-3 h-3 mr-1" />
          Collapse
        </Button>
      </div>
    </div>
  );
};
