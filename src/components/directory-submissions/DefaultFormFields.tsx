
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";
import { SubmissionType } from "./submissionConfig";
import { BaseFormFields } from "./BaseFormFields";
import { CollapsibleSection } from "./CollapsibleSection";

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
    <div className="space-y-6">
      {/* Core Fields */}
      <BaseFormFields formData={formData} onInputChange={onInputChange} />

      {!isMentor && (
        <div className="space-y-2">
          <Label htmlFor="organization" className="text-base font-medium text-gray-700">
            {isServiceProvider ? 'Company Name' :
             isTradeAgency ? 'Agency Name' :
             'Organization Name'} *
          </Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) => onInputChange('organization', e.target.value)}
            required
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter your ${isServiceProvider ? 'company' : 'organization'} name`}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="services" className="text-base font-medium text-gray-700">
          {isMentor ? 'Areas you can mentor in' :
           isServiceProvider ? 'Services Offered' :
           isTradeAgency ? 'Services Provided' :
           'Services/Programs Offered'} {!isMentor ? '*' : ''}
        </Label>
        <Textarea
          id="services"
          value={formData.services}
          onChange={(e) => onInputChange('services', e.target.value)}
          placeholder={
            isMentor
              ? "e.g., Market entry strategy, Regulatory compliance, Business development..."
              : "Please describe your services, expertise, or programs..."
          }
          required={!isMentor}
          rows={3}
        />
      </div>

      {isMentor && (
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-base font-medium text-gray-700">
            Short Bio *
          </Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => onInputChange('experience', e.target.value)}
            placeholder="A brief summary of your background and why you'd be a great mentor (3-4 sentences)"
            rows={3}
            required
          />
        </div>
      )}

      {/* Optional Fields */}
      <CollapsibleSection>
        {isMentor && (
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-base font-medium text-gray-700">
              Current Organization
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onInputChange('organization', e.target.value)}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Where do you currently work?"
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

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium text-gray-700">
            Additional Details
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Any additional information or questions..."
            rows={3}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};
