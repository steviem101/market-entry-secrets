
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";

interface BaseFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const BaseFormFields = ({ formData, onInputChange }: BaseFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Full Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium text-gray-700">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium text-gray-700">
            Phone Number
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="+61 400 000 000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium text-gray-700">
            Location *
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            required
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="City, Country"
          />
        </div>
      </div>
    </div>
  );
};
