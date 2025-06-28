
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubmissionType } from "./submissionConfig";
import { FormData, initialFormData } from "./types";
import { EventFormFields } from "./EventFormFields";
import { ContentFormFields } from "./ContentFormFields";
import { DataRequestFormFields } from "./DataRequestFormFields";
import { DefaultFormFields } from "./DefaultFormFields";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: SubmissionType;
  title: string;
}

export const SubmissionModal = ({ isOpen, onClose, submissionType, title }: SubmissionModalProps) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('directory_submissions')
        .insert({
          submission_type: submissionType,
          contact_email: formData.email,
          form_data: formData
        });

      if (error) throw error;

      const successMessage = submissionType === 'data_request' 
        ? "Request submitted successfully! We'll review your requirements and get back to you soon."
        : "Submission successful! Thank you for your submission. We'll review it and get back to you soon.";

      toast({
        title: submissionType === 'data_request' ? "Request Submitted!" : "Submission Successful!",
        description: successMessage,
      });

      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: submissionType === 'data_request' ? "Request Failed" : "Submission Failed",
        description: submissionType === 'data_request' 
          ? "There was an error submitting your request. Please try again."
          : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (submissionType) {
      case 'event':
        return <EventFormFields formData={formData} onInputChange={handleInputChange} />;
      case 'content':
        return <ContentFormFields formData={formData} onInputChange={handleInputChange} />;
      case 'data_request':
        return <DataRequestFormFields formData={formData} onInputChange={handleInputChange} />;
      default:
        return <DefaultFormFields formData={formData} onInputChange={handleInputChange} submissionType={submissionType} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (submissionType === 'data_request' ? 'Submitting Request...' : 'Submitting...') 
                : (submissionType === 'data_request' ? 'Submit Request' : 'Submit Application')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
