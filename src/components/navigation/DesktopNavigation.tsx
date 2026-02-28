
import { Link, useLocation } from "react-router-dom";
import { NavigationDropdown } from "./NavigationDropdown";
import {
  coreNavItems,
  directoryNavItems,
  exploreNavItems,
  resourcesNavItems,
  dropdownTriggers,
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
    <nav className="hidden lg:flex items-center space-x-1">
      {/* Directory Dropdown */}
      <NavigationDropdown
        label={dropdownTriggers.directory.label}
        icon={dropdownTriggers.directory.icon}
        items={directoryNavItems}
      />

      {/* Explore Dropdown */}
      <NavigationDropdown
        label={dropdownTriggers.explore.label}
        icon={dropdownTriggers.explore.icon}
        items={exploreNavItems}
      />

      {/* Core Navigation Items: Events, Leads */}
      {coreNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.href);

        return (
          <Link
            key={item.href}
            to={item.href}
            className={`nav-link flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? "text-primary bg-accent/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      {/* Resources Dropdown */}
      <NavigationDropdown
        label={dropdownTriggers.resources.label}
        icon={dropdownTriggers.resources.icon}
        items={resourcesNavItems}
      />

      {/* Pricing Link */}
      <Link
        to="/pricing"
        className={`nav-link flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
          isActivePath("/pricing")
            ? "text-primary bg-accent/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        }`}
      >
        Pricing
      </Link>
    </nav>
  );
};
