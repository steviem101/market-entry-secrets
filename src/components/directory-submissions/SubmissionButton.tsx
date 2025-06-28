
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmissionModal } from "./SubmissionModal";
import { getSubmissionConfig, SubmissionType } from "./submissionConfig";

interface SubmissionButtonProps {
  submissionType: SubmissionType;
  variant?: 'hero' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

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
