
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";
import { Search, MessageCircle } from "lucide-react";

export const SearchSection = () => {
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find What You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search our comprehensive database or ask our AI assistant to find the exact resources for your market entry needs
            </p>
          </div>

          {/* Search Interface */}
          <div className="max-w-4xl mx-auto">
            <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'database' | 'ai')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/60 backdrop-blur-md border border-border/50 soft-shadow max-w-md mx-auto">
                <TabsTrigger value="database" className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Database
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Ask AI Assistant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-2 mt-0">
                <MasterSearch placeholder="Search for service providers, mentors, leads, events..." />
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-2 mt-0">
                <div className="max-w-3xl mx-auto">
                  <AIChatSearch placeholder="Ask me: 'How do I find legal partners for Australian market entry?'" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
