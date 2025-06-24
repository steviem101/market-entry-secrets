
import { Link } from "react-router-dom";
import MarketEntryLogo from "./MarketEntryLogo";
import { AuthButton } from "./auth/AuthButton";
import { DesktopNavigation } from "./navigation/DesktopNavigation";
import { MobileNavigation } from "./navigation/MobileNavigation";
import { useScrollEffect } from "@/hooks/useScrollEffect";

const Navigation = () => {
  const scrolled = useScrollEffect(50);

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-md shadow-lg border-border/50 scale-[1.02] transform-gpu' 
        : 'bg-background border-border'
    }`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}>
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className={`flex items-center space-x-2 transition-all duration-300 ${
              scrolled ? 'transform scale-95' : ''
            }`}>
              <MarketEntryLogo className="h-8 w-8" />
              <span className="font-bold text-lg">Market Entry Secrets</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Sign In Section */}
          <div className="flex items-center space-x-4">
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
