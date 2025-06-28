
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Navigation from "./components/Navigation";
import { HomePage } from "./pages/Index";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import ServiceProvidersPage from "./pages/ServiceProviders";
import TradeAgenciesPage from "./pages/TradeInvestmentAgencies";
import InnovationOrganizationsPage from "./pages/InnovationEcosystem";
import EventsPage from "./pages/Events";
import ContentPage from "./pages/Content";
import CaseStudiesPage from "./pages/CaseStudies";
import TermsOfServicePage from "./pages/TermsOfService";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import NotFoundPage from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";
import { MemberHub } from "./pages/MemberHub";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/service-providers" element={<ServiceProvidersPage />} />
                <Route path="/trade-investment-agencies" element={<TradeAgenciesPage />} />
                <Route path="/innovation-ecosystem" element={<InnovationOrganizationsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route 
                  path="/hub" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <MemberHub />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
