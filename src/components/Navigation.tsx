
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

  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.href);
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            } ${isMobile ? "w-full justify-start" : ""}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <MarketEntryLogo className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block">
              Market Entry Hub
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <NavItems />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Auth Button */}
          <AuthButton />
          
          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="flex flex-col space-y-4 mt-8">
                <NavItems isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
