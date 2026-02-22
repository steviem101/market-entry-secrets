import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LeadGenPopupProvider } from "@/components/LeadGenPopupProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import ServiceProviders from "./pages/ServiceProviders";
import Events from "./pages/Events";
import EventDetailPage from "./pages/EventDetailPage";
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
import InnovationOrgPage from "./pages/InnovationOrgPage";
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
import MentorConnections from "./pages/MentorConnections";
import AuthCallback from "./pages/AuthCallback";
import Pricing from "./pages/Pricing";
import ReportCreator from "./pages/ReportCreator";
import ReportView from "./pages/ReportView";
import SharedReportView from "./pages/SharedReportView";
import MyReports from "./pages/MyReports";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <PersonaProvider>
          <LeadGenPopupProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/service-providers" element={<ServiceProviders />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:eventSlug" element={<EventDetailPage />} />
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
                  <Route path="/innovation-ecosystem/:orgId" element={<InnovationOrgPage />} />
                  <Route path="/trade-investment-agencies" element={<TradeInvestmentAgencies />} />
                  <Route path="/case-studies" element={<CaseStudies />} />
                  <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/partner" element={<PartnerWithUs />} />
                  <Route path="/dashboard" element={<MemberHub />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/member-hub" element={<MemberHub />} />
                  <Route path="/mentor-connections" element={<MentorConnections />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/report-creator" element={<ReportCreator />} />
                  <Route path="/report/:reportId" element={<ReportView />} />
                  <Route path="/report/shared/:shareToken" element={<SharedReportView />} />
                  <Route path="/my-reports" element={<MyReports />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </LeadGenPopupProvider>
          </PersonaProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
