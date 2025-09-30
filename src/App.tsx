
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LeadGenPopupProvider } from "@/components/LeadGenPopupProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import ServiceProviders from "./pages/ServiceProviders";
import Events from "./pages/Events";
import Community from "./pages/Community";
import Content from "./pages/Content";
import ContentDetail from "./pages/ContentDetail";
import Contact from "./pages/Contact";
import Locations from "./pages/Locations";
import LocationPage from "./pages/LocationPage";
import Countries from "./pages/Countries";
import CountryPage from "./pages/CountryPage";
import Sectors from "./pages/Sectors";
import SectorPage from "./pages/SectorPage";
import Leads from "./pages/Leads";
import InnovationEcosystem from "./pages/InnovationEcosystem";
import TradeInvestmentAgencies from "./pages/TradeInvestmentAgencies";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PartnerWithUs from "./pages/PartnerWithUs";
import Dashboard from "./pages/Dashboard";
import Bookmarks from "./pages/Bookmarks";
import MemberHub from "./pages/MemberHub";
import AuthCallback from "./pages/AuthCallback";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <LeadGenPopupProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/service-providers" element={<ServiceProviders />} />
              <Route path="/events" element={<Events />} />
              <Route path="/community" element={<Community />} />
              <Route path="/content" element={<Content />} />
              <Route path="/content/:slug" element={<ContentDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/locations/:locationSlug" element={<LocationPage />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/countries/:countrySlug" element={<CountryPage />} />
              <Route path="/sectors" element={<Sectors />} />
              <Route path="/sectors/:sectorSlug" element={<SectorPage />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/innovation-ecosystem" element={<InnovationEcosystem />} />
              <Route path="/trade-investment-agencies" element={<TradeInvestmentAgencies />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/partner" element={<PartnerWithUs />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/member-hub" element={<MemberHub />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LeadGenPopupProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
