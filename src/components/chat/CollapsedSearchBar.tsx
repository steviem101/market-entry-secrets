
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onExpand}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
            className="pl-10 pr-10 py-2 text-sm rounded-full border bg-background/90 backdrop-blur-sm w-64"
          />
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!query.trim() || loading}
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
