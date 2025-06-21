
import { Link, useLocation } from "react-router-dom";
import { Network, TrendingUp, FileText } from "lucide-react";
import { NavigationDropdown } from "./NavigationDropdown";
import { 
  primaryNavItems, 
  ecosystemNavItems, 
  popularNavItems, 
  infoNavItems 
} from "./NavigationItems";
import { useMemo } from "react";

export const DesktopNavigation = () => {
  const location = useLocation();

  const isActivePath = useMemo(() => (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <nav className="hidden lg:flex items-center space-x-4">
      {/* Ecosystem Dropdown */}
      <NavigationDropdown
        label="Ecosystem"
        icon={Network}
        items={ecosystemNavItems}
      />

      {/* Primary Navigation Items */}
      {primaryNavItems.map((item) => {
        const isActive = isActivePath(item.href);
        
        return (
          <Link
            key={`primary-${item.href}`}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      {/* Popular Dropdown */}
      <NavigationDropdown
        label="Popular"
        icon={TrendingUp}
        items={popularNavItems}
      />

      {/* Info Dropdown */}
      <NavigationDropdown
        label="Info"
        icon={FileText}
        items={infoNavItems}
      />
    </nav>
  );
};
