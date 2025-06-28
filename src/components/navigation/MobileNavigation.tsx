
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { navigationItems, getAuthenticatedNavigationItems } from "./NavigationItems";
import { useAuth } from "@/hooks/useAuth";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, isModerator } = useAuth();
  
  // Use different navigation items based on authentication status  
  const navItems = user ? getAuthenticatedNavigationItems(isAdmin(), isModerator()) : navigationItems;

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 font-medium text-foreground">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.href}
                        className="block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
