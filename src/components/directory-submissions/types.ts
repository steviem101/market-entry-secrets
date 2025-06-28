
export interface FormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  location: string;
  description: string;
  website: string;
  services: string;
  experience: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventCategory: string;
  expectedAttendees: string;
  contentTitle: string;
  contentCategory: string;
  industry: string;
  successStory: string;
  outcomes: string;
  businessSize: string;
  targetMarket: string;
  dataRequirements: string;
  useCase: string;
  [key: string]: string; // Add index signature for Json compatibility
}

export const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  location: '',
  description: '',
  website: '',
  services: '',
  experience: '',
  eventTitle: '',
  eventDate: '',
  eventTime: '',
  eventCategory: '',
  expectedAttendees: '',
  contentTitle: '',
  contentCategory: '',
  industry: '',
  successStory: '',
  outcomes: '',
  businessSize: '',
  targetMarket: '',
  dataRequirements: '',
  useCase: ''
};
