import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: 'mentor' | 'service_provider' | 'trade_agency' | 'innovation_organization' | 'event' | 'content' | 'data_request';
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
    experience: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    eventCategory: '',
    expectedAttendees: '',
    contentTitle: '',
    contentCategory: '',
    industry: '',
    successStory: '',
    outcomes: '',
    businessSize: '',
    targetMarket: '',
    dataRequirements: '',
    useCase: ''
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

      const successMessage = submissionType === 'data_request' 
        ? "Request submitted successfully! We'll review your requirements and get back to you soon."
        : "Submission successful! Thank you for your submission. We'll review it and get back to you soon.";

      toast({
        title: submissionType === 'data_request' ? "Request Submitted!" : "Submission Successful!",
        description: successMessage,
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
        experience: '',
        eventTitle: '',
        eventDate: '',
        eventTime: '',
        eventCategory: '',
        expectedAttendees: '',
        contentTitle: '',
        contentCategory: '',
        industry: '',
        successStory: '',
        outcomes: '',
        businessSize: '',
        targetMarket: '',
        dataRequirements: '',
        useCase: ''
      });
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
    const baseFields = (
      <>
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
      </>
    );

    switch (submissionType) {
      case 'event':
        return (
          <>
            {baseFields}
            <div>
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                value={formData.eventTitle}
                onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventTime">Event Time *</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                <Input
                  id="expectedAttendees"
                  type="number"
                  value={formData.expectedAttendees}
                  onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="eventCategory">Event Category *</Label>
              <Select onValueChange={(value) => handleInputChange('eventCategory', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="organization">Organizing Company/Institution *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Event Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label htmlFor="description">Event Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event, agenda, and key topics..."
                required
              />
            </div>
          </>
        );

      case 'content':
        return (
          <>
            {baseFields}
            <div>
              <Label htmlFor="contentTitle">Success Story Title *</Label>
              <Input
                id="contentTitle"
                value={formData.contentTitle}
                onChange={(e) => handleInputChange('contentTitle', e.target.value)}
                placeholder="e.g., How We Expanded to Australia in 6 Months"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Company Name *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Manufacturing"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contentCategory">Content Category *</Label>
              <Select onValueChange={(value) => handleInputChange('contentCategory', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select content category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market_entry">Market Entry</SelectItem>
                  <SelectItem value="expansion">Business Expansion</SelectItem>
                  <SelectItem value="partnership">Partnership Success</SelectItem>
                  <SelectItem value="regulatory">Regulatory Navigation</SelectItem>
                  <SelectItem value="funding">Funding & Investment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label htmlFor="successStory">Your Success Story *</Label>
              <Textarea
                id="successStory"
                value={formData.successStory}
                onChange={(e) => handleInputChange('successStory', e.target.value)}
                placeholder="Tell us about your journey, challenges faced, and how you overcame them..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="outcomes">Key Outcomes & Results *</Label>
              <Textarea
                id="outcomes"
                value={formData.outcomes}
                onChange={(e) => handleInputChange('outcomes', e.target.value)}
                placeholder="Quantify your success: revenue growth, market share, partnerships gained, etc."
                required
              />
            </div>
          </>
        );

      case 'data_request':
        return (
          <>
            {baseFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Business/Company Name *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessSize">Business Size *</Label>
                <Select onValueChange={(value) => handleInputChange('businessSize', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                    <SelectItem value="small">Small (11-50 employees)</SelectItem>
                    <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                    <SelectItem value="large">Large (200+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Manufacturing, Healthcare"
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetMarket">Target Market/Geography *</Label>
                <Input
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  placeholder="e.g., Sydney, Melbourne, NSW, Australia-wide"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label htmlFor="dataRequirements">Data Requirements *</Label>
              <Textarea
                id="dataRequirements"
                value={formData.dataRequirements}
                onChange={(e) => handleInputChange('dataRequirements', e.target.value)}
                placeholder="Specify what type of data you need: lead lists, TAM maps, market analysis, contact databases, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="useCase">Use Case & Timeline *</Label>
              <Textarea
                id="useCase"
                value={formData.useCase}
                onChange={(e) => handleInputChange('useCase', e.target.value)}
                placeholder="How will you use this data? What's your timeline for market entry or expansion?"
                required
              />
            </div>
          </>
        );

      default:
        // Existing mentor, service_provider, trade_agency, innovation_organization cases
        return (
          <>
            {baseFields}
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
          </>
        );
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
