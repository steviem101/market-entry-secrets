
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";

interface HeroSectionProps {
  totalResources: number;
  searchMode: 'database' | 'ai';
  onSearchModeChange: (mode: 'database' | 'ai') => void;
}

export const HeroSection = ({ totalResources, searchMode, onSearchModeChange }: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Gateway to the
            <span className="text-primary block">Australian Market</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            Connect with vetted service providers, learn from success stories, and accelerate your market entry with expert guidance.
          </p>

          {/* Total Counter */}
          <div className="inline-flex items-center justify-center bg-primary/5 border border-primary/20 rounded-full px-6 py-3 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalResources.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground font-medium">Total Resources Available</div>
            </div>
          </div>
          
          {/* Unified Search Interface */}
          <div className="max-w-3xl mx-auto mb-12">
            <Tabs value={searchMode} onValueChange={onSearchModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50 backdrop-blur-sm">
                <TabsTrigger value="database" className="text-sm font-medium">
                  🔍 Search Database
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium">
                  🤖 Ask AI Assistant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-2">
                <MasterSearch placeholder="Search for legal, accounting, marketing services..." />
                <p className="text-sm text-muted-foreground">
                  Search through our curated database of service providers and resources
                </p>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-2">
                <AIChatSearch placeholder="Ask me anything about entering the Australian market..." />
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance from our AI assistant trained on market entry expertise
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
