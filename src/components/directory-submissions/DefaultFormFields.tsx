
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
  const isMentor = submissionType === 'mentor';
  const isServiceProvider = submissionType === 'service_provider';
  const isTradeAgency = submissionType === 'trade_agency';
  
  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h3>
          <p className="text-gray-600">Tell us about yourself</p>
        </div>
        
        <BaseFormFields formData={formData} onInputChange={onInputChange} />
      </div>

      {/* Professional Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isMentor ? 'Professional Background' : 'Organization Details'}
          </h3>
          <p className="text-gray-600">
            {isMentor 
              ? 'Share your professional experience and expertise' 
              : 'Information about your organization'}
          </p>
        </div>

        {!isMentor && (
          <div className="space-y-3">
            <Label htmlFor="organization" className="text-lg font-semibold text-gray-800">
              {isServiceProvider ? 'Company Name' : 
               isTradeAgency ? 'Agency Name' :
               'Organization Name'} *
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onInputChange('organization', e.target.value)}
              required={!isMentor}
              className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              placeholder={`Enter your ${isServiceProvider ? 'company' : 'organization'} name`}
            />
          </div>
        )}

        {isMentor && (
          <div className="space-y-3">
            <Label htmlFor="organization" className="text-lg font-semibold text-gray-800">
              Current Organization
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onInputChange('organization', e.target.value)}
              className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              placeholder="Where do you currently work? (Optional)"
            />
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="website" className="text-lg font-semibold text-gray-800">
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder="https://www.example.com"
            className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          />
        </div>
      </div>

      {/* Expertise/Services Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isMentor ? 'Areas of Expertise' : 'Services & Offerings'}
          </h3>
          <p className="text-gray-600">
            {isMentor 
              ? 'What areas can you provide mentorship in?' 
              : 'What services do you offer?'}
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="services" className="text-lg font-semibold text-gray-800">
            {isMentor ? 'Expertise Areas' :
             isServiceProvider ? 'Services Offered' :
             isTradeAgency ? 'Services Provided' :
             'Services/Programs Offered'} {!isMentor && '*'}
          </Label>
          <Textarea
            id="services"
            value={formData.services}
            onChange={(e) => onInputChange('services', e.target.value)}
            placeholder={
              isMentor 
                ? "e.g., Market entry strategy, Regulatory compliance, Business development, Sales & marketing..."
                : "Please describe your services, expertise, or programs in detail..."
            }
            required={!isMentor}
            rows={5}
            className="text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none rounded-lg p-4"
          />
        </div>

        {isMentor && (
          <div className="space-y-3">
            <Label htmlFor="experience" className="text-lg font-semibold text-gray-800">
              Experience & Background *
            </Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => onInputChange('experience', e.target.value)}
              placeholder="Tell us about your professional background, years of experience, key achievements, and why you'd be a great mentor for businesses entering Australia..."
              rows={6}
              className="text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none rounded-lg p-4"
              required
            />
          </div>
        )}
      </div>

      {/* Additional Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Additional Information</h3>
          <p className="text-gray-600">Anything else you'd like us to know?</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg font-semibold text-gray-800">
            Additional Details
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Any additional information, special requirements, or questions you'd like to share..."
            rows={4}
            className="text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none rounded-lg p-4"
          />
        </div>
      </div>
    </div>
  );
};
