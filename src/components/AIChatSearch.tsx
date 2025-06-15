
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
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setChatState(prev => ({ ...prev, isMinimized: false }))}
          className="rounded-full w-12 h-12 p-0 shadow-lg"
          size="default"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Collapsed State */}
      {chatState.isCollapsed && (
        <CollapsedSearchBar
          query={query}
          setQuery={setQuery}
          loading={loading}
          onSubmit={handleSubmit}
          onExpand={handleExpand}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      {/* Expanded Search Bar */}
      {!chatState.isCollapsed && !chatState.isExpanded && (
        <div className="w-80">
          <ExpandedSearchBar
            query={query}
            setQuery={setQuery}
            loading={loading}
            placeholder={placeholder}
            onSubmit={handleSubmit}
            onExpand={handleExpand}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>
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
