
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
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />
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
          onChange={(e) => onInputChange('organization', e.target.value)}
          required={submissionType !== 'mentor'}
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange('website', e.target.value)}
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
          onChange={(e) => onInputChange('services', e.target.value)}
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
            onChange={(e) => onInputChange('experience', e.target.value)}
            placeholder="Tell us about your professional background and expertise..."
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Additional Information</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Any additional information you'd like to share..."
        />
      </div>
    </>
  );
};
