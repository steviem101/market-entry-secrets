
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
import { ArrowLeft, X } from "lucide-react";

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
          form_data: formData as any
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

  const getSubtitleText = () => {
    switch (submissionType) {
      case 'mentor':
        return "Share your expertise and help businesses successfully enter the Australian market. Join our community of experienced mentors.";
      case 'service_provider':
        return "List your services and connect with businesses looking to enter the Australian market.";
      case 'event':
        return "Submit your market entry event to be featured in our events calendar.";
      case 'content':
        return "Share your insights and expertise through our content platform.";
      case 'data_request':
        return "Request specific market data or research to support your business entry.";
      default:
        return "Fill out the form below and we'll get back to you soon.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 p-0">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 p-8 pb-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-left">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-3">
                {title}
              </DialogTitle>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {getSubtitleText()}
              </p>
            </div>
          </DialogHeader>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6">
              {renderFormFields()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-8 py-3 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting 
                  ? (submissionType === 'data_request' ? 'Submitting Request...' : 'Submitting Application...') 
                  : (submissionType === 'data_request' ? 'Submit Request' : 'Submit Application')
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
