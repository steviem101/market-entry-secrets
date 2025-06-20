
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";

interface AIChatSearchProps {
  placeholder?: string;
  className?: string;
}

export const AIChatSearch = ({ 
  placeholder = "Ask our AI assistant anything...", 
  className = "" 
}: AIChatSearchProps) => {
  const [query, setQuery] = useState("");
  const { sendMessage, loading, createConversation, currentConversation } = useAIChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const message = query.trim();
    setQuery("");
    
    if (!currentConversation) {
      await createConversation(`Chat: ${message.slice(0, 30)}...`);
    }
    
    await sendMessage(message);
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className={`relative ${className}`}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              disabled={loading}
              className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-full"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-accent/50"
              >
                <X className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};
