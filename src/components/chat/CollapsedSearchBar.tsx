
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
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <MessageCircle className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
          <Input
            type="text"
            placeholder="Ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onExpand}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
            className="pl-7 pr-7 py-1 text-xs rounded-full border bg-background/90 backdrop-blur-sm w-40"
          />
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!query.trim() || loading}
            size="sm"
            className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 rounded-full"
          >
            <Send className="w-2.5 h-2.5" />
          </Button>
        </div>
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
