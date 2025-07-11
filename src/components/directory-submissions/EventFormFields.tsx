
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";
import { BaseFormFields } from "./BaseFormFields";

interface EventFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export const EventFormFields = ({ formData, onInputChange }: EventFormFieldsProps) => {
  return (
    <>
      <BaseFormFields formData={formData} onInputChange={onInputChange} />
      <div>
        <Label htmlFor="eventTitle">Event Title *</Label>
        <Input
          id="eventTitle"
          value={formData.eventTitle}
          onChange={(e) => onInputChange('eventTitle', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(e) => onInputChange('eventDate', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="eventTime">Event Time *</Label>
          <Input
            id="eventTime"
            type="time"
            value={formData.eventTime}
            onChange={(e) => onInputChange('eventTime', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="expectedAttendees">Expected Attendees</Label>
          <Input
            id="expectedAttendees"
            type="number"
            value={formData.expectedAttendees}
            onChange={(e) => onInputChange('expectedAttendees', e.target.value)}
            placeholder="e.g., 50"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="eventCategory">Event Category *</Label>
        <Select onValueChange={(value) => onInputChange('eventCategory', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select event category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="trade_show">Trade Show</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="organization">Organizing Company/Institution *</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => onInputChange('organization', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="website">Event Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange('website', e.target.value)}
          placeholder="https://"
        />
      </div>
      <div>
        <Label htmlFor="eventLogoUrl">Event Logo URL</Label>
        <Input
          id="eventLogoUrl"
          type="url"
          value={formData.eventLogoUrl}
          onChange={(e) => onInputChange('eventLogoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>
      <div>
        <Label htmlFor="description">Event Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe your event, agenda, and key topics..."
          required
        />
      </div>
    </>
  );
};
