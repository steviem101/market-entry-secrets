
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
  // Case study specific fields (map to content_company_profiles)
  originCountry: string;
  entryDate: string;
  monthlyRevenue: string;
  startupCosts: string;
  businessModel: string;
  outcomeResult: string;
  founderName: string;
  founderTitle: string;
  founderLinkedin: string;
  employeeCount: string;
  founderCount: string;
  // Guide specific fields
  guideTitle: string;
  guideSubtitle: string;
  guideBody: string;
  guideSectorTags: string;
  [key: string]: string; // Index signature for Json compatibility
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
  useCase: '',
  originCountry: '',
  entryDate: '',
  monthlyRevenue: '',
  startupCosts: '',
  businessModel: '',
  outcomeResult: '',
  founderName: '',
  founderTitle: '',
  founderLinkedin: '',
  employeeCount: '',
  founderCount: '',
  guideTitle: '',
  guideSubtitle: '',
  guideBody: '',
  guideSectorTags: ''
};
