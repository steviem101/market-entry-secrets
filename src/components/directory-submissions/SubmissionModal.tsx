
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: 'mentor' | 'service_provider' | 'trade_agency' | 'innovation_organization';
  title: string;
}

export const SubmissionModal = ({ isOpen, onClose, submissionType, title }: SubmissionModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    location: '',
    description: '',
    website: '',
    services: '',
    experience: ''
  });
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

      toast({
        title: "Submission Successful!",
        description: "Thank you for your submission. We'll review it and get back to you soon.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        location: '',
        description: '',
        website: '',
        services: '',
        experience: ''
      });
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="organization">
              {submissionType === 'mentor' ? 'Current Organization' : 
               submissionType === 'service_provider' ? 'Company Name *' :
               submissionType === 'trade_agency' ? 'Agency Name *' :
               'Organization Name *'}
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              required={submissionType !== 'mentor'}
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://"
            />
          </div>

          <div>
            <Label htmlFor="services">
              {submissionType === 'mentor' ? 'Areas of Expertise' :
               submissionType === 'service_provider' ? 'Services Offered *' :
               submissionType === 'trade_agency' ? 'Services Provided *' :
               'Services/Programs Offered *'}
            </Label>
            <Textarea
              id="services"
              value={formData.services}
              onChange={(e) => handleInputChange('services', e.target.value)}
              placeholder="Please describe your services, expertise, or programs..."
              required={submissionType !== 'mentor'}
            />
          </div>

          {submissionType === 'mentor' && (
            <div>
              <Label htmlFor="experience">Experience & Background</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Tell us about your professional background and expertise..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Additional Information</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
