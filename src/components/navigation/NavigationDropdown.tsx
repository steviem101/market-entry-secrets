
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
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link to={item.href} className="flex items-center gap-2">
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
