
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Calendar, Globe, Phone, Mail, ExternalLink } from "lucide-react";
import { Company } from "./CompanyCard";

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (company: Company) => void;
}

const CompanyModal = ({ company, isOpen, onClose, onContact }: CompanyModalProps) => {
  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{company.name}</DialogTitle>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {company.location}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
            <p className="text-muted-foreground leading-relaxed">
              {company.description}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Why work with us</h3>
            <p className="text-muted-foreground leading-relaxed">
              At <span className="text-primary font-medium">{company.name}</span>, we streamline business solutions, 
              enabling brands to connect globally through our unique and cost-effective platform. Partnering with us 
              helps brands connect with clients who align with their values, elevating visibility, building trust, 
              and enhancing growth through authentic engagement.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {company.services.map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Year founded</div>
                  <div className="font-medium">{company.founded}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">No of Employees</div>
                  <div className="font-medium">{company.employees}</div>
                </div>
              </div>
              {company.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center"
                    >
                      Visit Site <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              onClick={() => onContact(company)}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyModal;
