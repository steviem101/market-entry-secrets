
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";
import { SubmissionType } from "./submissionConfig";
import { BaseFormFields } from "./BaseFormFields";

interface DefaultFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  submissionType: SubmissionType;
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
          <h3 className="text-lg font-semibold text-gray-900">
            {submissionType === 'mentor' ? 'Professional Background' : 'Organization Details'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {submissionType === 'mentor' 
              ? 'Share your professional experience and expertise' 
              : 'Information about your organization'}
          </p>
        </div>

        {submissionType !== 'mentor' && (
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
              required={submissionType !== 'mentor'}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder={`Enter your ${submissionType === 'service_provider' ? 'company' : 'organization'} name`}
            />
          </div>
        )}

        {submissionType === 'mentor' && (
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-base font-medium text-gray-700">
              Current Organization
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onInputChange('organization', e.target.value)}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Where do you currently work? (Optional)"
            />
          </div>
        )}

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
          <h3 className="text-lg font-semibold text-gray-900">
            {submissionType === 'mentor' ? 'Areas of Expertise' : 'Services & Offerings'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {submissionType === 'mentor' 
              ? 'What areas can you provide mentorship in?' 
              : 'What services do you offer?'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="services" className="text-base font-medium text-gray-700">
            {submissionType === 'mentor' ? 'Expertise Areas' :
             submissionType === 'service_provider' ? 'Services Offered' :
             submissionType === 'trade_agency' ? 'Services Provided' :
             'Services/Programs Offered'} {submissionType !== 'mentor' && '*'}
          </Label>
          <Textarea
            id="services"
            value={formData.services}
            onChange={(e) => onInputChange('services', e.target.value)}
            placeholder={
              submissionType === 'mentor' 
                ? "e.g., Market entry strategy, Regulatory compliance, Business development, Sales & marketing..."
                : "Please describe your services, expertise, or programs in detail..."
            }
            required={submissionType !== 'mentor'}
            rows={4}
            className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>

        {submissionType === 'mentor' && (
          <div className="space-y-2">
            <Label htmlFor="experience" className="text-base font-medium text-gray-700">
              Experience & Background *
            </Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => onInputChange('experience', e.target.value)}
              placeholder="Tell us about your professional background, years of experience, key achievements, and why you'd be a great mentor for businesses entering Australia..."
              rows={5}
              className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              required
            />
          </div>
        )}
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
