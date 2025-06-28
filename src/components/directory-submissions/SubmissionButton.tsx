
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building, Globe, Lightbulb, Calendar, FileText, Database } from "lucide-react";
import { SubmissionModal } from "./SubmissionModal";

interface SubmissionButtonProps {
  submissionType: 'mentor' | 'service_provider' | 'trade_agency' | 'innovation_organization' | 'event' | 'content' | 'data_request';
  variant?: 'hero' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

const getSubmissionConfig = (type: SubmissionButtonProps['submissionType']) => {
  switch (type) {
    case 'mentor':
      return {
        title: 'Apply to Become a Mentor',
        buttonText: 'Become a Mentor',
        icon: Users,
        modalTitle: 'Apply to Become a Mentor'
      };
    case 'service_provider':
      return {
        title: 'List Your Service',
        buttonText: 'List Your Service',
        icon: Building,
        modalTitle: 'Submit Your Service Provider Application'
      };
    case 'trade_agency':
      return {
        title: 'Submit Your Agency',
        buttonText: 'Submit Your Agency',
        icon: Globe,
        modalTitle: 'Submit Your Trade & Investment Agency'
      };
    case 'innovation_organization':
      return {
        title: 'Join the Ecosystem',
        buttonText: 'Join the Ecosystem',
        icon: Lightbulb,
        modalTitle: 'Submit Your Innovation Organization'
      };
    case 'event':
      return {
        title: 'Submit Your Event',
        buttonText: 'Submit Event',
        icon: Calendar,
        modalTitle: 'Submit Your Event'
      };
    case 'content':
      return {
        title: 'Share Your Success Story',
        buttonText: 'Submit Content',
        icon: FileText,
        modalTitle: 'Submit Your Success Story'
      };
    case 'data_request':
      return {
        title: 'Request Custom Data',
        buttonText: 'Request Data',
        icon: Database,
        modalTitle: 'Request Custom Market Data'
      };
  }
};

export const SubmissionButton = ({ 
  submissionType, 
  variant = 'hero', 
  size = 'default' 
}: SubmissionButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = getSubmissionConfig(submissionType);
  const IconComponent = config.icon;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size={size}
        className={variant === 'hero' ? 'text-lg px-8 py-3' : ''}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {config.buttonText}
      </Button>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submissionType={submissionType}
        title={config.modalTitle}
      />
    </>
  );
};
