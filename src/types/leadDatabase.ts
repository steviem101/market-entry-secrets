export interface LeadDatabase {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  list_type: string | null;
  record_count: number | null;
  sector: string | null;
  location: string | null;
  quality_score: number | null;
  price_aud: number | null;
  is_free: boolean;
  is_featured: boolean;
  preview_available: boolean;
  tags: string[] | null;
  provider_name: string | null;
  provider_logo_url: string | null;
  last_updated: string | null;
  sample_fields: string[] | null;
  cover_image_url: string | null;
  stripe_price_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeadDatabaseRecord {
  id: string;
  lead_database_id: string;
  company_name: string | null;
  contact_name: string | null;
  job_title: string | null;
  company_description: string | null;
  sector: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string;
  linkedin_url: string | null;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  revenue_range: string | null;
  employee_count_range: string | null;
  founded_year: number | null;
  buying_signals: string[] | null;
  technologies_used: string[] | null;
  notes: string | null;
  is_preview: boolean;
  created_at: string;
}
