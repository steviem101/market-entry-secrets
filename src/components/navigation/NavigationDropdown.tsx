
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { NavItem } from "./NavigationItems";

interface NavigationDropdownProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const NavigationDropdown = ({ label, icon: Icon, items }: NavigationDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="nav-link flex items-center gap-2 transition-all duration-200">
          <Icon className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="animate-in fade-in-0 zoom-in-95 duration-200">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild className="transition-colors duration-150">
              <Link to={item.href} className="flex items-center gap-2 w-full">
                <ItemIcon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
