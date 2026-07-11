
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Company } from "./CompanyCard";
import { CompanyModalHeader } from "./company-modal/CompanyModalHeader";
import { CompanyModalSections } from "./company-modal/CompanyModalSections";
import { CompanyModalDetails } from "./company-modal/CompanyModalDetails";
import { CompanyModalFooter } from "./company-modal/CompanyModalFooter";

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (company: Company) => void;
}

const CompanyModal = ({ company, isOpen, onClose, onContact }: CompanyModalProps) => {
  if (!company) return null;

  // Helper function to safely parse JSONB arrays
  const parseJsonArray = (jsonData: any): any[] => {
    if (!jsonData) return [];
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Placeholder images for experience tiles (company logos/work samples)
  const getExperienceTileImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=center"
    ];
    return images[index % images.length];
  };

  // Use the correct property names from the database with proper parsing
  const experienceTiles = parseJsonArray(company.experience_tiles || company.experienceTiles || []);
  const contactPersons = parseJsonArray(company.contact_persons || company.contactPersons || []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <CompanyModalHeader company={company} />
        </DialogHeader>

        <CompanyModalSections
          company={company}
          experienceTiles={experienceTiles}
          contactPersons={contactPersons}
          getExperienceTileImage={getExperienceTileImage}
        />

        <CompanyModalDetails company={company} />

        <CompanyModalFooter 
          company={company}
          onClose={onClose}
          onContact={onContact}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CompanyModal;
