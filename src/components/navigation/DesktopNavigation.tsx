
import { Link } from "react-router-dom";
import { NavigationDropdown } from "./NavigationDropdown";
import { navigationItems, getAuthenticatedNavigationItems } from "./NavigationItems";
import { useAuth } from "@/hooks/useAuth";

export const DesktopNavigation = () => {
  const { user, isAdmin, isModerator } = useAuth();
  
  // Use different navigation items based on authentication status
  const navItems = user ? getAuthenticatedNavigationItems(isAdmin(), isModerator()) : navigationItems;

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => (
        <div key={item.name}>
          <NavigationDropdown
            name={item.name}
            subItems={item.subItems}
            icon={item.icon}
          />
        </div>
      ))}
    </nav>
  );
};
