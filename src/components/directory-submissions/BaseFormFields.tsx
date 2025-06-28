
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";

interface BaseFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const BaseFormFields = ({ formData, onInputChange }: BaseFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
};
