
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";

interface DataRequestFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const DataRequestFormFields = ({ formData, onInputChange }: DataRequestFormFieldsProps) => {
  return (
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="organization">Business/Company Name *</Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) => onInputChange('organization', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="businessSize">Business Size *</Label>
          <Select onValueChange={(value) => onInputChange('businessSize', value)} required>
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
            onChange={(e) => onInputChange('industry', e.target.value)}
            placeholder="e.g., Technology, Manufacturing, Healthcare"
            required
          />
        </div>
        <div>
          <Label htmlFor="targetMarket">Target Market/Geography *</Label>
          <Input
            id="targetMarket"
            value={formData.targetMarket}
            onChange={(e) => onInputChange('targetMarket', e.target.value)}
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
          onChange={(e) => onInputChange('website', e.target.value)}
          placeholder="https://"
        />
      </div>
      <div>
        <Label htmlFor="dataRequirements">Data Requirements *</Label>
        <Textarea
          id="dataRequirements"
          value={formData.dataRequirements}
          onChange={(e) => onInputChange('dataRequirements', e.target.value)}
          placeholder="Specify what type of data you need: lead lists, TAM maps, market analysis, contact databases, etc."
          required
        />
      </div>
      <div>
        <Label htmlFor="useCase">Use Case & Timeline *</Label>
        <Textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => onInputChange('useCase', e.target.value)}
          placeholder="How will you use this data? What's your timeline for market entry or expansion?"
          required
        />
      </div>
    </>
  );
};
