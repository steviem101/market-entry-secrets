
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NavItem } from "./NavigationItems";

interface NavigationDropdownProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const NavigationDropdown = ({ label, icon: Icon, items }: NavigationDropdownProps) => {
  const location = useLocation();

  const isChildActive = items.some((item) => location.pathname.startsWith(item.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`nav-link flex items-center gap-2 ${
            isChildActive
              ? "text-primary bg-accent/30"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[280px]">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link to={item.href} className="flex items-start gap-3 w-full px-3 py-2.5">
                <ItemIcon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">{item.description}</span>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
