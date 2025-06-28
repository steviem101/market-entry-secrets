import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/hooks/use-toast";

import { Navigation } from "./components/navigation/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { ServiceProvidersPage } from "./pages/ServiceProvidersPage";
import { TradeAgenciesPage } from "./pages/TradeAgenciesPage";
import { InnovationOrganizationsPage } from "./pages/InnovationOrganizationsPage";
import { EventsPage } from "./pages/EventsPage";
import { ContentPage } from "./pages/ContentPage";
import { CaseStudiesPage } from "./pages/CaseStudiesPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";
import { LeadGenPopupProvider } from "./components/LeadGenPopup";
import { MemberHub } from "./pages/MemberHub";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <LeadGenPopupProvider>
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
                  <Route path="/trade-agencies" element={<TradeAgenciesPage />} />
                  <Route path="/innovation-organizations" element={<InnovationOrganizationsPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/content" element={<ContentPage />} />
                  <Route path="/case-studies" element={<CaseStudiesPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <PageTransition>
                          <ProfilePage />
                        </PageTransition>
                      </ProtectedRoute>
                    }
                  />
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
      </LeadGenPopupProvider>
    </QueryClientProvider>
  );
}

export default App;
