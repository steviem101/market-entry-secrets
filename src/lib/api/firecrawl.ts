import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
  results?: { section: string; success: boolean; error?: string }[];
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Enrich content using Firecrawl + AI
  async enrichContent(contentId: string, sectionIds?: string[]): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('enrich-content', {
      body: { content_id: contentId, section_ids: sectionIds },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Enrich innovation ecosystem organizations
  async enrichInnovationEcosystem(organizationId?: string, onlyMissing?: boolean): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('enrich-innovation-ecosystem', {
      body: { organization_id: organizationId, only_missing: onlyMissing },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
