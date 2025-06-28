
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
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ServiceProviders from "./pages/ServiceProviders";
import TradeInvestmentAgencies from "./pages/TradeInvestmentAgencies";
import InnovationEcosystem from "./pages/InnovationEcosystem";
import Events from "./pages/Events";
import Content from "./pages/Content";
import CaseStudies from "./pages/CaseStudies";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
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
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/service-providers" element={<ServiceProviders />} />
                <Route path="/trade-investment-agencies" element={<TradeInvestmentAgencies />} />
                <Route path="/innovation-ecosystem" element={<InnovationEcosystem />} />
                <Route path="/events" element={<Events />} />
                <Route path="/content" element={<Content />} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
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
