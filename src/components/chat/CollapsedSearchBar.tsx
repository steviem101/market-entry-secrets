
import { MessageCircle, Send, X } from "lucide-react";
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
  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        type="text"
        placeholder="Ask our AI about market entry strategies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={onExpand}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
        className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
      />
      {query ? (
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={!query.trim() || loading}
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      ) : null}
    </div>
  );
};
