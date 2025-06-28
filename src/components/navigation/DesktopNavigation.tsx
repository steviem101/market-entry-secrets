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
          {item.subItems ? (
            <NavigationDropdown
              name={item.name}
              subItems={item.subItems}
              icon={item.icon}
            />
          ) : (
            <Link
              to={item.href}
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
            >
              <div className="flex items-center space-x-2">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </div>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
