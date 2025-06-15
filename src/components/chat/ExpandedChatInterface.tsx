
import { Send, X, Minimize2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessages } from "./ChatMessages";
import { ChatMessage } from "@/hooks/useAIChat";

interface ExpandedChatInterfaceProps {
  query: string;
  setQuery: (query: string) => void;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onToggleCollapse: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const ExpandedChatInterface = ({
  query,
  setQuery,
  messages,
  loading,
  error,
  onSubmit,
  onToggleCollapse,
  onMinimize,
  onClose
}: ExpandedChatInterfaceProps) => {
  return (
    <Card className="absolute bottom-0 right-0 w-96 h-[500px] shadow-2xl border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[420px] p-4">
        <ChatMessages messages={messages} loading={loading} />

        {error && (
          <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!query.trim() || loading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
