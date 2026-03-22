import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LeadGenPopupProvider } from "@/components/LeadGenPopupProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";

// Eagerly load critical landing page
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load all other pages for code splitting
const About = React.lazy(() => import("./pages/About"));
const ServiceProviders = React.lazy(() => import("./pages/ServiceProviders"));
const ServiceProviderPage = React.lazy(() => import("./pages/ServiceProviderPage"));
const Events = React.lazy(() => import("./pages/Events"));
const EventDetailPage = React.lazy(() => import("./pages/EventDetailPage"));
const MentorsDirectory = React.lazy(() => import("./pages/MentorsDirectory"));
const MentorProfile = React.lazy(() => import("./pages/MentorProfile"));
const Content = React.lazy(() => import("./pages/Content"));
const ContentDetail = React.lazy(() => import("./pages/ContentDetail"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Locations = React.lazy(() => import("./pages/Locations"));
const LocationPage = React.lazy(() => import("./pages/LocationPage"));
const Countries = React.lazy(() => import("./pages/Countries"));
const CountryPage = React.lazy(() => import("./pages/CountryPage"));
const Sectors = React.lazy(() => import("./pages/Sectors"));
const SectorPage = React.lazy(() => import("./pages/SectorPage"));
const Leads = React.lazy(() => import("./pages/Leads"));
const LeadDatabaseDetailPage = React.lazy(() => import("./pages/LeadDatabaseDetailPage"));
const InnovationEcosystem = React.lazy(() => import("./pages/InnovationEcosystem"));
const InnovationOrgPage = React.lazy(() => import("./pages/InnovationOrgPage"));
const Investors = React.lazy(() => import("./pages/Investors"));
const InvestorPage = React.lazy(() => import("./pages/InvestorPage"));
const TradeInvestmentAgencies = React.lazy(() => import("./pages/TradeInvestmentAgencies"));
const AgencyDetailPage = React.lazy(() => import("./pages/AgencyDetailPage"));
const CaseStudies = React.lazy(() => import("./pages/CaseStudies"));
const CaseStudyDetail = React.lazy(() => import("./pages/CaseStudyDetail"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const PartnerWithUs = React.lazy(() => import("./pages/PartnerWithUs"));
const Bookmarks = React.lazy(() => import("./pages/Bookmarks"));
const MemberHub = React.lazy(() => import("./pages/MemberHub"));
const MentorConnections = React.lazy(() => import("./pages/MentorConnections"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const ReportCreator = React.lazy(() => import("./pages/ReportCreator"));
const ReportView = React.lazy(() => import("./pages/ReportView"));
const SharedReportView = React.lazy(() => import("./pages/SharedReportView"));
const MyReports = React.lazy(() => import("./pages/MyReports"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AdminSubmissions = React.lazy(() => import("./pages/AdminSubmissions"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
              <ErrorBoundary>
              <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/service-providers" element={<ServiceProviders />} />
                  <Route path="/service-providers/:providerSlug" element={<ServiceProviderPage />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:eventSlug" element={<EventDetailPage />} />
                  <Route path="/community" element={<Navigate to="/mentors" replace />} />
                  <Route path="/mentors" element={<MentorsDirectory />} />
                  <Route path="/mentors/:categorySlug" element={<MentorsDirectory />} />
                  <Route path="/mentors/:categorySlug/:mentorSlug" element={<MentorProfile />} />
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
                  <Route path="/leads/:slug" element={<LeadDatabaseDetailPage />} />
                  <Route path="/innovation-ecosystem" element={<InnovationEcosystem />} />
                  <Route path="/innovation-ecosystem/:slug" element={<InnovationOrgPage />} />
                  <Route path="/investors" element={<Investors />} />
                  <Route path="/investors/:slug" element={<InvestorPage />} />
                  <Route path="/government-support" element={<TradeInvestmentAgencies />} />
                  <Route path="/government-support/:slug" element={<AgencyDetailPage />} />
                  <Route path="/trade-investment-agencies" element={<Navigate to="/government-support" replace />} />
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
                  <Route path="/planner" element={<Navigate to="/report-creator" replace />} />
                  <Route path="/report-creator" element={<ReportCreator />} />
                  <Route path="/report/shared/:shareToken" element={<SharedReportView />} />
                  <Route path="/report/:reportId" element={<ReportView />} />
                  <Route path="/my-reports" element={<MyReports />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin/submissions" element={<AdminSubmissions />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </Layout>
              </ErrorBoundary>
            </BrowserRouter>
          </LeadGenPopupProvider>
          </PersonaProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
