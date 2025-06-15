
import { MessageCircle, Send, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CollapsedSearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onExpand: () => void;
  onToggleCollapse: () => void;
}

export const CollapsedSearchBar = ({
  query,
  setQuery,
  loading,
  onSubmit,
  onExpand,
  onToggleCollapse
}: CollapsedSearchBarProps) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-1 bg-background/95 backdrop-blur-sm rounded-full border shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative flex-1">
          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onExpand}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
            className="pl-10 pr-12 py-2 text-sm rounded-full border-0 bg-transparent focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 w-48 h-9"
          />
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!query.trim() || loading}
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:scale-110 transition-all duration-200 disabled:hover:scale-100"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full hover:bg-accent/80 transition-all duration-200 hover:scale-110"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
