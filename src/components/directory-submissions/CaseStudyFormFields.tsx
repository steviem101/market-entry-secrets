import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";

interface CaseStudyFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const CaseStudyFormFields = ({ formData, onInputChange }: CaseStudyFormFieldsProps) => {
  return (
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h3>
        <div className="space-y-4">
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
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                value={formData.targetMarket}
                onChange={(e) => onInputChange('targetMarket', e.target.value)}
                placeholder="Australia"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryDate">Market Entry Date *</Label>
              <Input
                id="entryDate"
                value={formData.entryDate}
                onChange={(e) => onInputChange('entryDate', e.target.value)}
                placeholder="e.g., March 2022"
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
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Details</h3>
        <div className="space-y-4">
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
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="founderCount">Number of Founders</Label>
              <Input
                id="founderCount"
                type="number"
                value={formData.founderCount}
                onChange={(e) => onInputChange('founderCount', e.target.value)}
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <Label htmlFor="employeeCount">Number of AU Employees</Label>
              <Input
                id="employeeCount"
                type="number"
                value={formData.employeeCount}
                onChange={(e) => onInputChange('employeeCount', e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="founderName">Primary Founder/Contact Name *</Label>
              <Input
                id="founderName"
                value={formData.founderName}
                onChange={(e) => onInputChange('founderName', e.target.value)}
                placeholder="e.g., Marcus Chen"
                required
              />
            </div>
            <div>
              <Label htmlFor="founderTitle">Title/Role</Label>
              <Input
                id="founderTitle"
                value={formData.founderTitle}
                onChange={(e) => onInputChange('founderTitle', e.target.value)}
                placeholder="e.g., Co-founder & CEO"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="founderLinkedin">LinkedIn Profile</Label>
            <Input
              id="founderLinkedin"
              type="url"
              value={formData.founderLinkedin}
              onChange={(e) => onInputChange('founderLinkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Story</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="successStory">Your Market Entry Story *</Label>
            <Textarea
              id="successStory"
              value={formData.successStory}
              onChange={(e) => onInputChange('successStory', e.target.value)}
              placeholder="Tell us about your journey entering the Australian market — challenges faced, strategies used, and how things played out..."
              rows={6}
              required
            />
          </div>
          <div>
            <Label htmlFor="outcomes">Key Outcomes & Results *</Label>
            <Textarea
              id="outcomes"
              value={formData.outcomes}
              onChange={(e) => onInputChange('outcomes', e.target.value)}
              placeholder="Quantify your results: revenue growth, market share, partnerships gained, or lessons from failure..."
              rows={4}
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};
