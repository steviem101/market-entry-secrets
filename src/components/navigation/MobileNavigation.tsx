
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import MarketEntryLogo from "@/components/MarketEntryLogo";
import { AuthButton } from "@/components/auth/AuthButton";
import { allNavItems } from "./NavigationItems";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
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
              onClick={handleLinkClick}
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
                    className={`nav-link flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md ${
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={handleLinkClick}
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
  );
};
