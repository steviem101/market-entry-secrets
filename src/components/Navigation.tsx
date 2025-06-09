
import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import MarketEntryLogo from "./MarketEntryLogo";

const Navigation = () => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <MarketEntryLogo />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Market Entry Secrets</h1>
              <p className="text-muted-foreground text-sm">Your One Stop Shop for Australian Market Entry</p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link to="/" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                          <div className="mb-2 mt-4 text-lg font-medium">
                            All Services
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Browse all market entry service providers
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link to="/innovation-ecosystem" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Innovation Ecosystem</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Connect with Australia's innovation landscape
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/community" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    Community
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/case-studies" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    Case Studies
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/about" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/contact" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
