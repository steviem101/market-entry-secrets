
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Users, FileText, Calendar, Building2, TrendingUp, Phone, Info, HelpCircle } from "lucide-react";
import MarketEntryLogo from "./MarketEntryLogo";
import { AuthButton } from "./auth/AuthButton";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/service-providers", label: "Service Providers", icon: Building2 },
    { href: "/mentors", label: "Community", icon: Users },
    { href: "/content", label: "Content", icon: FileText },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/innovation-ecosystem", label: "Innovation Ecosystem", icon: TrendingUp },
    { href: "/trade-investment-agencies", label: "Trade & Investment", icon: Building2 },
    { href: "/leads", label: "Leads", icon: TrendingUp },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <MarketEntryLogo className="h-8 w-8" />
              <span className="font-bold text-lg">Market Entry Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <Link
                      to="/"
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <MarketEntryLogo className="h-6 w-6" />
                      <span className="font-bold">Market Entry Hub</span>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.href);
                        
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                              isActive 
                                ? "bg-accent text-accent-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Mobile Auth */}
                  <div className="border-t pt-4">
                    <AuthButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
