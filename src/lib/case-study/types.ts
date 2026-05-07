export interface CaseStudySource {
  id: string;
  case_study_id: string;
  section_id: string | null;
  label: string;
  url: string;
  accessed_at: string | null;
  source_type: string | null;
  citation_number: number | null;
}

export interface CaseStudyQuote {
  id: string;
  case_study_id: string;
  section_id: string | null;
  quote: string;
  attributed_to: string;
  role: string | null;
  source_url: string | null;
  source_label: string | null;
  display_order: number;
}

export interface QuickFact {
  label: string;
  value: string;
  icon?: string;
}

export interface BodyImage {
  url: string;
  alt: string;
  caption?: string;
  credit?: string;
  position_after_section_id?: string;
}

export type LinkerEntryType = "company" | "person";

export interface LinkerEntry {
  name: string;
  href: string;
  type: LinkerEntryType;
  fallback?: boolean;
}
