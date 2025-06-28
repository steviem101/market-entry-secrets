
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";

interface ContentFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const ContentFormFields = ({ formData, onInputChange }: ContentFormFieldsProps) => {
  return (
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />
      <div>
        <Label htmlFor="contentTitle">Success Story Title *</Label>
        <Input
          id="contentTitle"
          value={formData.contentTitle}
          onChange={(e) => onInputChange('contentTitle', e.target.value)}
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
            onChange={(e) => onInputChange('organization', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry *</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => onInputChange('industry', e.target.value)}
            placeholder="e.g., Technology, Manufacturing"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="contentCategory">Content Category *</Label>
        <Select onValueChange={(value) => onInputChange('contentCategory', value)} required>
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
          onChange={(e) => onInputChange('website', e.target.value)}
          placeholder="https://"
        />
      </div>
      <div>
        <Label htmlFor="successStory">Your Success Story *</Label>
        <Textarea
          id="successStory"
          value={formData.successStory}
          onChange={(e) => onInputChange('successStory', e.target.value)}
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
          onChange={(e) => onInputChange('outcomes', e.target.value)}
          placeholder="Quantify your success: revenue growth, market share, partnerships gained, etc."
          required
        />
      </div>
    </>
  );
};
