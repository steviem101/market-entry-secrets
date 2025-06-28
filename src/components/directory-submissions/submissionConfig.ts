
import { Users, Building, Globe, Lightbulb, Calendar, FileText, Database } from "lucide-react";

export type SubmissionType = 'mentor' | 'service_provider' | 'trade_agency' | 'innovation_organization' | 'event' | 'content' | 'data_request';

export interface SubmissionConfig {
  title: string;
  buttonText: string;
  icon: any;
  modalTitle: string;
}

export const getSubmissionConfig = (type: SubmissionType): SubmissionConfig => {
  switch (type) {
    case 'mentor':
      return {
        title: 'Apply to Become a Mentor',
        buttonText: 'Become a Mentor',
        icon: Users,
        modalTitle: 'Apply to Become a Mentor'
      };
    case 'service_provider':
      return {
        title: 'List Your Service',
        buttonText: 'List Your Service',
        icon: Building,
        modalTitle: 'Submit Your Service Provider Application'
      };
    case 'trade_agency':
      return {
        title: 'Submit Your Agency',
        buttonText: 'Submit Your Agency',
        icon: Globe,
        modalTitle: 'Submit Your Trade & Investment Agency'
      };
    case 'innovation_organization':
      return {
        title: 'Join the Ecosystem',
        buttonText: 'Join the Ecosystem',
        icon: Lightbulb,
        modalTitle: 'Submit Your Innovation Organization'
      };
    case 'event':
      return {
        title: 'Submit Your Event',
        buttonText: 'Submit Event',
        icon: Calendar,
        modalTitle: 'Submit Your Event'
      };
    case 'content':
      return {
        title: 'Share Your Success Story',
        buttonText: 'Submit Content',
        icon: FileText,
        modalTitle: 'Submit Your Success Story'
      };
    case 'data_request':
      return {
        title: 'Request Custom Data',
        buttonText: 'Request Data',
        icon: Database,
        modalTitle: 'Request Custom Market Data'
      };
  }
};
