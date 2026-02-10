
import { Link } from "react-router-dom";
import MarketEntryLogo from "./MarketEntryLogo";
import { AuthButton } from "./auth/AuthButton";
import { DesktopNavigation } from "./navigation/DesktopNavigation";
import { MobileNavigation } from "./navigation/MobileNavigation";

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background overflow-visible">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center relative z-10">
            <Link to="/" className="flex items-center py-2">
              <MarketEntryLogo size="lg" className="-my-6" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
