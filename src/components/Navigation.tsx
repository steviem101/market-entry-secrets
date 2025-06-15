
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import MarketEntryLogo from "./MarketEntryLogo";

const Navigation = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleMouseEnter = (dropdownName: string) => {
    setOpenDropdown(dropdownName);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

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
          <div className="flex items-center space-x-1">
            <Link to="/" className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              Home
            </Link>
            
            {/* Ecosystem Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('ecosystem')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                Ecosystem
                <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", openDropdown === 'ecosystem' && "rotate-180")} />
              </button>
              
              {openDropdown === 'ecosystem' && (
                <div className="absolute top-full left-0 mt-1 w-[450px] bg-popover border border-border rounded-md shadow-lg z-50">
                  <div className="grid gap-3 p-6">
                    <Link 
                      to="/service-providers" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Service Providers</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Browse all market entry service providers
                      </p>
                    </Link>
                    <Link 
                      to="/innovation-ecosystem" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Innovation Ecosystem</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Connect with Australia's innovation landscape
                      </p>
                    </Link>
                    <Link 
                      to="/trade-investment-agencies" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Trade & Investment Agencies</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Government agencies and chambers of commerce
                      </p>
                    </Link>
                    <Link 
                      to="/mentors" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Mentors</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Connect with experienced mentors and advisors
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/leads" className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              Leads
            </Link>

            <Link to="/events" className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              Events
            </Link>

            <Link to="/content" className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              Content
            </Link>

            {/* About Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('about')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                About
                <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", openDropdown === 'about' && "rotate-180")} />
              </button>
              
              {openDropdown === 'about' && (
                <div className="absolute top-full right-0 mt-1 w-[350px] bg-popover border border-border rounded-md shadow-lg z-50">
                  <div className="grid gap-3 p-6">
                    <Link 
                      to="/about" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">About Us</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Our mission, story, and team
                      </p>
                    </Link>
                    <Link 
                      to="/partner-with-us" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Partner With Us</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Join our ecosystem and collaborate with us
                      </p>
                    </Link>
                    <Link 
                      to="/contact" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Contact</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Get in touch with our team
                      </p>
                    </Link>
                    <Link 
                      to="/faq" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">FAQ</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Frequently asked questions
                      </p>
                    </Link>
                    <Link 
                      to="/privacy-policy" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Privacy Policy</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        How we protect your privacy
                      </p>
                    </Link>
                    <Link 
                      to="/terms-of-service" 
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Terms of Service</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Terms and conditions
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
