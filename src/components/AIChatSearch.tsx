
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";
import { AIChatSearchProps, ChatState } from "./chat/types";
import { CollapsedSearchBar } from "./chat/CollapsedSearchBar";
import { ExpandedSearchBar } from "./chat/ExpandedSearchBar";
import { ExpandedChatInterface } from "./chat/ExpandedChatInterface";

export const AIChatSearch = ({ 
  placeholder = "Ask our AI assistant anything...", 
  className = "" 
}: AIChatSearchProps) => {
  const [query, setQuery] = useState("");
  const [chatState, setChatState] = useState<ChatState>({
    isExpanded: false,
    isMinimized: false,
    isCollapsed: true
  });

  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    currentConversation,
    createConversation 
  } = useAIChat();

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

  const handleExpand = () => {
    setChatState({ isExpanded: true, isMinimized: false, isCollapsed: false });
  };

  const handleMinimize = () => {
    setChatState(prev => ({ ...prev, isMinimized: true }));
  };

  const handleClose = () => {
    setChatState({ isExpanded: false, isMinimized: false, isCollapsed: true });
  };

  const handleToggleCollapse = () => {
    if (chatState.isCollapsed) {
      setChatState({ isExpanded: true, isMinimized: false, isCollapsed: false });
    } else {
      setChatState({ isExpanded: false, isMinimized: false, isCollapsed: true });
    }
  };

  if (chatState.isMinimized) {
    return (
      <Button
        onClick={() => setChatState(prev => ({ ...prev, isMinimized: false }))}
        className={cn("rounded-full w-10 h-10 p-0", className)}
        size="default"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className={className}>
      {/* Collapsed State - Matching MasterSearch styling exactly */}
      {chatState.isCollapsed && (
        <div className="relative">
          <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      {/* Expanded Search Bar */}
      {!chatState.isCollapsed && !chatState.isExpanded && (
        <ExpandedSearchBar
          query={query}
          setQuery={setQuery}
          loading={loading}
          placeholder={placeholder}
          onSubmit={handleSubmit}
          onExpand={handleExpand}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      {/* Expanded Chat Interface */}
      {chatState.isExpanded && (
        <ExpandedChatInterface
          query={query}
          setQuery={setQuery}
          messages={messages}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onToggleCollapse={handleToggleCollapse}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
