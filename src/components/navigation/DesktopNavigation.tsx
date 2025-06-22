
import { Link, useLocation } from "react-router-dom";
import { Network, TrendingUp, FileText } from "lucide-react";
import { NavigationDropdown } from "./NavigationDropdown";
import { 
  primaryNavItems, 
  ecosystemNavItems, 
  popularNavItems, 
  infoNavItems 
} from "./NavigationItems";

export const DesktopNavigation = () => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

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
        const Icon = item.icon;
        const isActive = isActivePath(item.href);
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`nav-link flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary hover:bg-accent/50 rounded-md ${
              isActive 
                ? "text-primary bg-accent/30" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
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
