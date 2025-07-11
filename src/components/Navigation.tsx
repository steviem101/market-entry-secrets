
import { useState } from "react";
import { Link } from "react-router-dom";
import MarketEntryLogo from "./MarketEntryLogo";
import { AuthButton } from "./auth/AuthButton";
import { DesktopNavigation } from "./navigation/DesktopNavigation";
import { MobileNavigation } from "./navigation/MobileNavigation";
import { MarketEntryReportModal } from "./MarketEntryReportModal";

const Navigation = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <MarketEntryLogo className="h-8 w-8" />
                <span className="font-bold text-lg">Market Entry Secrets</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <DesktopNavigation />

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <AuthButton onReportModalOpen={() => setIsReportModalOpen(true)} />
              </div>

              {/* Mobile Menu */}
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>
      
      {/* Market Entry Report Modal */}
      <MarketEntryReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};

export default Navigation;
