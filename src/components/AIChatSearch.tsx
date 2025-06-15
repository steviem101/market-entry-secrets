
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minimize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    currentConversation,
    createConversation 
  } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setIsExpanded(true);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className={cn("rounded-full w-12 h-12 p-0", className)}
        size="default"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleExpand}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm border-primary/20"
          />
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <Card className="absolute bottom-0 right-0 w-96 h-[500px] shadow-2xl border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[420px] p-4">
            {/* Messages Area */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation with our AI assistant!</p>
                    <p className="text-sm mt-1">Ask about market entry, services, or anything else.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-lg text-sm",
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground ml-4"
                            : "bg-muted mr-4"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.isPlaceholder && (
                          <p className="text-xs opacity-70 mt-1">
                            (Custom GPT integration ready)
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg mr-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Error Display */}
            {error && (
              <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                {error}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex gap-2">
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
      )}
    </div>
  );
};
