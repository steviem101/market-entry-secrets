
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import MarketEntryLogo from "./MarketEntryLogo";
import { EmailCaptureForm } from "./EmailCaptureForm";
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
    { label: "Mentors", href: "/mentors" },
    { label: "Content Library", href: "/content" },
    { label: "Market Leads", href: "/leads" },
    { label: "Innovation Ecosystem", href: "/innovation-ecosystem" }
  ];

  const resourceLinks = [
    { label: "Countries", href: "/countries" },
    { label: "Sectors", href: "/sectors" },
    { label: "Locations", href: "/locations" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Government Support", href: "/government-support" },
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
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="block mb-4">
              <MarketEntryLogo size="lg" className="h-16 w-auto" />
            </Link>
            
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Your comprehensive platform for dominating the Australian market. Connect with vetted service providers, access expert insights, and accelerate your business growth.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-4">
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
              <a href="https://www.linkedin.com/company/market-entry-secrets" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5 text-primary" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                <Instagram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Links</h3>
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
            <h3 className="font-semibold text-lg mb-4 text-foreground">Resources</h3>
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
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Stay Updated</h3>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Get the latest market insights, new service provider listings, and exclusive content delivered to your inbox.
            </p>
            
            <EmailCaptureForm source="footer_newsletter" buttonText="Subscribe" />
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="my-4 bg-border/50" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Market Entry Secrets. All rights reserved.
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
