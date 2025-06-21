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
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <MarketEntryLogo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Market Entry Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavItems />
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              className="flex items-center"
              to="/"
              onClick={() => setIsOpen(false)}
            >
              <MarketEntryLogo className="mr-2 h-4 w-4" />
              <span className="font-bold">Market Entry Hub</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                <NavItems isMobile />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="inline-flex items-center space-x-2 md:hidden" to="/">
              <MarketEntryLogo className="h-6 w-6" />
              <span className="font-bold">Market Entry Hub</span>
            </Link>
          </div>
          <nav className="flex items-center">
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
