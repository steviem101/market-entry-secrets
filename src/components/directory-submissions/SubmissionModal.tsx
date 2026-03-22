
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { SubmissionType } from "./submissionConfig";
import { FormData, initialFormData } from "./types";
import { EventFormFields } from "./EventFormFields";
import { ContentFormFields } from "./ContentFormFields";
import { CaseStudyFormFields } from "./CaseStudyFormFields";
import { GuideFormFields } from "./GuideFormFields";
import { DataRequestFormFields } from "./DataRequestFormFields";
import { DefaultFormFields } from "./DefaultFormFields";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: SubmissionType;
  title: string;
}

export const SubmissionModal = ({ isOpen, onClose, submissionType, title }: SubmissionModalProps) => {
  const { user, profile } = useAuth();
  const prefilled = useMemo<FormData>(() => {
    if (!user || !profile) return initialFormData;
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return {
      ...initialFormData,
      ...(name && { name }),
      ...(user.email && { email: user.email }),
      ...(profile.location && { location: profile.location }),
      ...(profile.company_name && { organization: profile.company_name }),
      ...(profile.website && { website: profile.website }),
    };
  }, [user, profile]);

  const [formData, setFormData] = useState<FormData>(prefilled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) setFormData(prefilled);
  }, [isOpen, prefilled]);

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData(prefilled);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const structuredFormData: Record<string, unknown> = {
        submission_version: 2,
        content_type: submissionType,
        ...formData
      };

      const insertData: Record<string, unknown> = {
        submission_type: submissionType,
        contact_email: formData.email,
        form_data: structuredFormData,
      };
      if (user?.id) {
        insertData.submitter_user_id = user.id;
      }

      const { error } = await supabase
        .from('directory_submissions')
        .insert(insertData as any);

      if (error) throw error;

      setSubmittedEmail(formData.email);
      setFormData(initialFormData);
      setIsSubmitted(true);
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
      case 'case_study':
        return <CaseStudyFormFields formData={formData} onInputChange={handleInputChange} />;
      case 'guide':
        return <GuideFormFields formData={formData} onInputChange={handleInputChange} />;
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
      case 'case_study':
        return "Share your company's Australian market entry story — whether a success or a failure, your experience helps others navigate the journey.";
      case 'guide':
        return "Share your expertise with a market entry guide. Help businesses navigate Australian regulations, compliance, and market opportunities.";
      case 'data_request':
        return "Request specific market data or research to support your business entry.";
      default:
        return "Fill out the form below and we'll get back to you soon.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 p-0">
        {isSubmitted ? (
          /* Success Confirmation State */
          <div className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {submissionType === 'data_request' ? 'Request Received!' : 'Submission Received!'}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Our team will review your {submissionType === 'data_request' ? 'request' : 'submission'} and
                respond to <span className="font-medium text-gray-900">{submittedEmail}</span> within 48 hours.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 p-8 pb-6">
              <DialogHeader className="space-y-4">
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
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">We'll review and respond within 48 hours.</p>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
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
                        ? (submissionType === 'data_request' ? 'Submitting...' : 'Submitting...')
                        : (submissionType === 'data_request' ? 'Submit Request' : 'Submit Application')
                      }
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
