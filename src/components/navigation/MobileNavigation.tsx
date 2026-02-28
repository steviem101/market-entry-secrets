
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Sparkles } from "lucide-react";
import MarketEntryLogo from "@/components/MarketEntryLogo";
import { AuthButton } from "@/components/auth/AuthButton";
import { mobileNavGroups } from "./NavigationItems";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile sheet on route change (handles back/forward navigation)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
          <div className="flex items-center pb-4 border-b">
            <Link
              to="/"
              className="flex items-center"
              onClick={handleLinkClick}
            >
              <MarketEntryLogo size="sm" />
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="py-4">
            <Link to="/report-creator" onClick={handleLinkClick} className="block">
              <Button variant="default" className="w-full" size="lg">
                <Sparkles className="h-5 w-5" />
                Get Your Report
              </Button>
            </Link>
            <Link
              to="/pricing"
              onClick={handleLinkClick}
              className="block text-center text-sm text-muted-foreground hover:text-primary mt-3"
            >
              View Pricing
            </Link>
          </div>

          <Separator />

          {/* Grouped Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {mobileNavGroups.map((group, groupIdx) => (
              <div key={group.label ?? `group-${groupIdx}`} className={groupIdx > 0 ? "mt-4" : ""}>
                {group.label && (
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
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
                {groupIdx < mobileNavGroups.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
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
