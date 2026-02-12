import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";

interface GuideFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const GuideFormFields = ({ formData, onInputChange }: GuideFormFieldsProps) => {
  return (
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Guide Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="guideTitle">Guide Title *</Label>
            <Input
              id="guideTitle"
              value={formData.guideTitle}
              onChange={(e) => onInputChange('guideTitle', e.target.value)}
              placeholder="e.g., Complete Guide to Australian Business Registration"
              required
            />
          </div>
          <div>
            <Label htmlFor="guideSubtitle">Subtitle / Summary</Label>
            <Input
              id="guideSubtitle"
              value={formData.guideSubtitle}
              onChange={(e) => onInputChange('guideSubtitle', e.target.value)}
              placeholder="A brief summary of what this guide covers"
            />
          </div>
          <div>
            <Label htmlFor="contentCategory">Category *</Label>
            <Select onValueChange={(value) => onInputChange('contentCategory', value)} value={formData.contentCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select guide category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_entry">Market Entry</SelectItem>
                <SelectItem value="legal_compliance">Legal & Compliance</SelectItem>
                <SelectItem value="business_expansion">Business Expansion</SelectItem>
                <SelectItem value="regulatory">Regulatory Navigation</SelectItem>
                <SelectItem value="funding">Funding & Investment</SelectItem>
                <SelectItem value="best_practices">Best Practices</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="guideSectorTags">Sector/Industry Tags</Label>
            <Input
              id="guideSectorTags"
              value={formData.guideSectorTags}
              onChange={(e) => onInputChange('guideSectorTags', e.target.value)}
              placeholder="e.g., Technology, Healthcare, FinTech (comma separated)"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Guide Content</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="guideBody">Guide Content *</Label>
            <Textarea
              id="guideBody"
              value={formData.guideBody}
              onChange={(e) => onInputChange('guideBody', e.target.value)}
              placeholder="Write your guide content here. Include practical advice, step-by-step instructions, and real-world examples..."
              rows={10}
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Author Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization">Organization / Company</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => onInputChange('organization', e.target.value)}
                placeholder="Your company or organization"
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
          </div>
          <div>
            <Label htmlFor="experience">Your Expertise & Background *</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => onInputChange('experience', e.target.value)}
              placeholder="Tell us about your experience with Australian market entry..."
              rows={3}
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};
