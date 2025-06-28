
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import MarketEntryLogo from "./MarketEntryLogo";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Facebook, 
  Linkedin, 
  Instagram,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual newsletter service integration
    setTimeout(() => {
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
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
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">Stay Updated</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Get the latest market insights, new service provider listings, and exclusive content delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-12 bg-background/50 border-border/50 focus:border-primary"
                  required
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Subscribe Now
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Newsletter Benefits */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Weekly market insights</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>New provider alerts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Exclusive content access</span>
              </div>
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
