
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Users, FileText, TrendingUp, Building2, Globe, ChevronDown, Network } from "lucide-react";
import MarketEntryLogo from "./MarketEntryLogo";
import { AuthButton } from "./auth/AuthButton";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Primary navigation items (always visible on desktop)
  const primaryNavItems = [
    { href: "/content", label: "Content", icon: FileText },
    { href: "/leads", label: "Leads", icon: TrendingUp },
  ];

  // Ecosystem dropdown items
  const ecosystemNavItems = [
    { href: "/service-providers", label: "Service Providers", icon: Building2 },
    { href: "/trade-investment-agencies", label: "Trade & Investment", icon: Building2 },
    { href: "/innovation-ecosystem", label: "Innovation Ecosystem", icon: Network },
    { href: "/mentors", label: "Mentors", icon: Users },
  ];

  // Popular dropdown items
  const popularNavItems = [
    { href: "/sectors", label: "Sectors", icon: TrendingUp },
    { href: "/countries", label: "Countries", icon: Globe },
  ];

  // Secondary navigation items (remaining items for mobile)
  const secondaryNavItems = [
    { href: "/events", label: "Events", icon: TrendingUp },
  ];

  // Footer/info items (in dropdown on desktop)
  const infoNavItems = [
    { href: "/about", label: "About", icon: FileText },
    { href: "/contact", label: "Contact", icon: FileText },
    { href: "/faq", label: "FAQ", icon: FileText },
  ];

  // All items for mobile menu
  const allNavItems = [...primaryNavItems, ...ecosystemNavItems, ...popularNavItems, ...secondaryNavItems, ...infoNavItems];

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
              <span className="font-bold text-lg">Market Entry Secrets</span>
            </Link>
          </div>

          {/* Desktop Navigation - Compact */}
          <nav className="hidden lg:flex items-center space-x-4">
            {/* Ecosystem Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Ecosystem
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ecosystemNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary Navigation Items */}
            {primaryNavItems.map((item) => {
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

            {/* Popular Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {popularNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Info Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Info
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {infoNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Sign In Section */}
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
                      <span className="font-bold">Market Entry Secrets</span>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-4">
                    <div className="space-y-2">
                      {allNavItems.map((item) => {
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
