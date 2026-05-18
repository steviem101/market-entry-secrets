export interface NarrativeBullet {
  h: string;
  b: string;
}

export interface DifferentiatorBullet {
  h: string;
  b: string;
}

export interface LiveSnapshotEntry {
  label: string;
  value: string;
  caption?: string;
}

export interface CountryPageContent {
  country_id: string;
  hero_headline: string;
  hero_subhead: string;
  hero_badge: string | null;
  hero_trust_companies: string[];
  hero_trust_extra: number;
  narrative_bullets: NarrativeBullet[];
  differentiators: DifferentiatorBullet[];
  pull_quote: string | null;
  pull_quote_attr: string | null;
  live_snapshot: LiveSnapshotEntry[] | null;
  featured_city_slugs: string[];
}

export interface CountryTradeMetric {
  id: string;
  country_id: string;
  sort_order: number;
  value: string;
  label: string;
  source: string;
  source_url: string | null;
  delta: string | null;
  positive: boolean;
}

export interface CountryCaseStudy {
  id: string;
  country_id: string;
  sort_order: number;
  company_name: string;
  sector: string;
  outcome: string;
  logo_color: string | null;
  wordmark: string | null;
  content_item_id: string | null;
}

export interface CountryPlaybookStage {
  id: string;
  country_id: string;
  stage_number: number;
  title: string;
  time_range: string;
  summary: string;
  sub_steps: string[];
}

export type FundingSide = "origin" | "destination";

export interface CountryFundingInstrument {
  id: string;
  country_id: string;
  side: FundingSide;
  sort_order: number;
  title: string;
  body: string;
  tag: string;
}

export interface CountryFaq {
  id: string;
  country_id: string;
  sort_order: number;
  question: string;
  answer: string;
}
