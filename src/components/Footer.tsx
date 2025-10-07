
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import MarketEntryLogo from "./MarketEntryLogo";
import { 
  Mail, 
  MapPin, 
  Facebook, 
  Linkedin, 
  Instagram
} from "lucide-react";

export const Footer = () => {
  const quickLinks = [
    { label: "Service Providers", href: "/service-providers" },
    { label: "Events", href: "/events" },
    { label: "Community", href: "/community" },
    { label: "Content Library", href: "/content" },
    { label: "Market Leads", href: "/leads" },
    { label: "Innovation Ecosystem", href: "/innovation-ecosystem" }
  ];

  const resourceLinks = [
    { label: "Countries", href: "/countries" },
    { label: "Sectors", href: "/sectors" },
    { label: "Locations", href: "/locations" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Trade Agencies", href: "/trade-investment-agencies" },
    { label: "FAQ", href: "/faq" }
  ];

  const supportLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Partner With Us", href: "/partner" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ];

  return (
    <footer className="relative bg-background border-t">
      {/* Background gradients */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <MarketEntryLogo className="h-10 w-10" />
              <span className="font-bold text-xl text-foreground">Market Entry Secrets</span>
            </Link>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your comprehensive platform for dominating the Australian market. Connect with vetted service providers, access expert insights, and accelerate your business growth.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@marketentrysecrets.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Sydney, Melbourne, Brisbane</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5 text-primary" />
              </a>
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Instagram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-lg mb-6 text-foreground">Stay Updated</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Get the latest market insights, new service provider listings, and exclusive content delivered to your inbox.
            </p>
            
            {/* Beehiiv Newsletter Embed */}
            <div className="min-h-[207px] overflow-visible">
              <div 
                dangerouslySetInnerHTML={{
                  __html: `
                    <iframe 
                      src="https://subscribe-forms.beehiiv.com/570e944b-c9cb-436b-a319-f1c04b8048cf" 
                      class="beehiiv-embed" 
                      data-test-id="beehiiv-embed" 
                      frameborder="0" 
                      scrolling="no" 
                      style="width: 412px; height: 207px; margin: 0; border-radius: 0px 0px 0px 0px !important; background-color: transparent; box-shadow: 0 0 #0000; max-width: 100%;">
                    </iframe>
                  `
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="my-8 bg-border/50" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 Market Entry Secrets. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-6">
            {supportLinks.map((link) => (
              <Link 
                key={link.href}
                to={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
