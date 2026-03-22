import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";
import { CollapsibleSection } from "./CollapsibleSection";

interface CaseStudyFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const CaseStudyFormFields = ({ formData, onInputChange }: CaseStudyFormFieldsProps) => {
  return (
    <>
      {/* Core Fields */}
      <BaseFormFields formData={formData} onInputChange={onInputChange} />

      <div>
        <Label htmlFor="contentTitle">Case Study Title *</Label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originCountry">Origin Country *</Label>
          <Input
            id="originCountry"
            value={formData.originCountry}
            onChange={(e) => onInputChange('originCountry', e.target.value)}
            placeholder="e.g., United States, United Kingdom"
            required
          />
        </div>
        <div>
          <Label htmlFor="outcomeResult">Market Entry Outcome *</Label>
          <Select onValueChange={(value) => onInputChange('outcomeResult', value)} value={formData.outcomeResult}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="successful">Successful Market Entry</SelectItem>
              <SelectItem value="unsuccessful">Unsuccessful Market Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="successStory">Your Market Entry Story *</Label>
        <Textarea
          id="successStory"
          value={formData.successStory}
          onChange={(e) => onInputChange('successStory', e.target.value)}
          placeholder="Tell us about your journey entering the Australian market — challenges faced, strategies used, and how things played out..."
          rows={4}
          required
        />
      </div>

      {/* Optional Fields */}
      <CollapsibleSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryDate">Market Entry Date</Label>
            <Input
              id="entryDate"
              value={formData.entryDate}
              onChange={(e) => onInputChange('entryDate', e.target.value)}
              placeholder="e.g., March 2022"
            />
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyRevenue">Monthly Revenue (AUD)</Label>
            <Input
              id="monthlyRevenue"
              value={formData.monthlyRevenue}
              onChange={(e) => onInputChange('monthlyRevenue', e.target.value)}
              placeholder="e.g., $167,000"
            />
          </div>
          <div>
            <Label htmlFor="startupCosts">Market Entry Costs</Label>
            <Input
              id="startupCosts"
              value={formData.startupCosts}
              onChange={(e) => onInputChange('startupCosts', e.target.value)}
              placeholder="e.g., $75,000"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="businessModel">Business Model</Label>
          <Select onValueChange={(value) => onInputChange('businessModel', value)} value={formData.businessModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select business model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="one-time">One-time Purchase</SelectItem>
              <SelectItem value="freemium">Freemium</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="outcomes">Key Outcomes & Results</Label>
          <Textarea
            id="outcomes"
            value={formData.outcomes}
            onChange={(e) => onInputChange('outcomes', e.target.value)}
            placeholder="Quantify your results: revenue growth, market share, partnerships gained, or lessons from failure..."
            rows={3}
          />
        </div>
      </CollapsibleSection>
    </>
  );
};
