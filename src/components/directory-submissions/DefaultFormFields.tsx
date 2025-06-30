
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";
import { SubmissionType } from "./submissionConfig";
import { BaseFormFields } from "./BaseFormFields";

// Exclude 'mentor' from the submission types since DefaultFormFields doesn't handle mentors
type NonMentorSubmissionType = Exclude<SubmissionType, 'mentor'>;

interface DefaultFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  submissionType: NonMentorSubmissionType;
}

export const DefaultFormFields = ({ formData, onInputChange, submissionType }: DefaultFormFieldsProps) => {
  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
        </div>
        
        <BaseFormFields formData={formData} onInputChange={onInputChange} />
      </div>

      {/* Professional Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Organization Details</h3>
          <p className="text-sm text-gray-600 mt-1">Information about your organization</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization" className="text-base font-medium text-gray-700">
            {submissionType === 'service_provider' ? 'Company Name' : 
             submissionType === 'trade_agency' ? 'Agency Name' :
             'Organization Name'} *
          </Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) => onInputChange('organization', e.target.value)}
            required
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter your ${submissionType === 'service_provider' ? 'company' : 'organization'} name`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-base font-medium text-gray-700">
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder="https://www.example.com"
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Expertise/Services Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Services & Offerings</h3>
          <p className="text-sm text-gray-600 mt-1">What services do you offer?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="services" className="text-base font-medium text-gray-700">
            {submissionType === 'service_provider' ? 'Services Offered' :
             submissionType === 'trade_agency' ? 'Services Provided' :
             'Services/Programs Offered'} *
          </Label>
          <Textarea
            id="services"
            value={formData.services}
            onChange={(e) => onInputChange('services', e.target.value)}
            placeholder="Please describe your services, expertise, or programs in detail..."
            required
            rows={4}
            className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          <p className="text-sm text-gray-600 mt-1">Anything else you'd like us to know?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium text-gray-700">
            Additional Details
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Any additional information, special requirements, or questions you'd like to share..."
            rows={3}
            className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
