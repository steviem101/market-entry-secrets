
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "../CompanyCard";
import { useIntroRequest } from "@/components/directory/IntroRequestProvider";

interface CompanyModalFooterProps {
  company: Company;
  onClose: () => void;
  /** @deprecated warm intro now routes through the shared IntroRequestProvider. */
  onContact?: (company: Company) => void;
}

export const CompanyModalFooter = ({ company, onClose }: CompanyModalFooterProps) => {
  const { requestIntro } = useIntroRequest();
  return (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1"
      >
        Close
      </Button>
      <Button
        onClick={() => requestIntro({ entity: "service_provider", id: company.id, name: company.name })}
        className="flex-1"
      >
        <Handshake className="w-4 h-4 mr-2" />
        Get warm intro
      </Button>
    </div>
  );
};
