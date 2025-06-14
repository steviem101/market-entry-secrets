
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/service-providers" element={<ServiceProviders />} />
          <Route path="/mentors" element={<Community />} />
          <Route path="/content" element={<Content />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/innovation-ecosystem" element={<InnovationEcosystem />} />
          <Route path="/trade-investment-agencies" element={<TradeInvestmentAgencies />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
