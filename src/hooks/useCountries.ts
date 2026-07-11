// The canonical countries row shape. Data access moved to the RPCs behind
// useCountryPage (detail) and useCountryDirectory (listing); this module now
// only owns the row type.
export interface CountryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_title: string;
  hero_description: string;
  location_type: string;
  trade_relationship_strength: string | null;
  economic_indicators: Record<string, unknown> | null;
  key_industries: string[];
  keywords: string[];
  content_keywords: string[];
  service_keywords: string[];
  event_keywords: string[];
  lead_keywords: string[];
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
