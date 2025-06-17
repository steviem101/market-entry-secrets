
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIChatSearch } from "@/components/AIChatSearch";
import Index from "./pages/Index";
import ServiceProviders from "./pages/ServiceProviders";
import Community from "./pages/Community";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Content from "./pages/Content";
import ContentDetail from "./pages/ContentDetail";
import Events from "./pages/Events";
import InnovationEcosystem from "./pages/InnovationEcosystem";
import TradeInvestmentAgencies from "./pages/TradeInvestmentAgencies";
import Leads from "./pages/Leads";
import PartnerWithUs from "./pages/PartnerWithUs";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SectorPage from "./pages/SectorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/service-providers" element={<ServiceProviders />} />
            <Route path="/mentors" element={<Community />} />
            <Route path="/content" element={<Content />} />
            <Route path="/content/:slug" element={<ContentDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/innovation-ecosystem" element={<InnovationEcosystem />} />
            <Route path="/trade-investment-agencies" element={<TradeInvestmentAgencies />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/sectors/:sectorId" element={<SectorPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* AI Chat Assistant - available on all pages with improved positioning */}
          <div className="fixed bottom-4 right-4 z-[9999]">
            <AIChatSearch 
              placeholder="Ask our AI assistant about market entry..." 
              className="w-auto"
            />
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
