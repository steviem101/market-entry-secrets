import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin } from "../_shared/auth.ts";
import { buildCorsHeaders } from "../_shared/http.ts";

interface ContentSection {
  id: string;
  title: string;
  slug: string;
  content_id: string;
  sort_order: number;
}

interface SearchResult {
  url: string;
  title: string;
  markdown?: string;
  description?: string;
}

// Generate search query based on section title and content context
function generateSearchQuery(sectionTitle: string, contentTitle: string): string {
  const baseQuery = `${sectionTitle} ${contentTitle}`;
  
  // Add specific keywords based on section type
  const sectionLower = sectionTitle.toLowerCase();
  if (sectionLower.includes('overview')) {
    return `${baseQuery} market analysis statistics`;
  }
  if (sectionLower.includes('channel') || sectionLower.includes('distribution')) {
    return `${baseQuery} wholesale retail logistics`;
  }
  if (sectionLower.includes('state') || sectionLower.includes('region')) {
    return `${baseQuery} NSW Victoria Queensland regional`;
  }
  if (sectionLower.includes('regulatory') || sectionLower.includes('compliance')) {
    return `${baseQuery} import regulations requirements`;
  }
  if (sectionLower.includes('technology') || sectionLower.includes('ecommerce')) {
    return `${baseQuery} digital fulfillment automation`;
  }
  if (sectionLower.includes('case stud')) {
    return `${baseQuery} success story example`;
  }
  if (sectionLower.includes('strategy') || sectionLower.includes('implementation')) {
    return `${baseQuery} best practices guide`;
  }
  
  return baseQuery;
}

// Call Firecrawl Search API
async function searchWeb(query: string, apiKey: string): Promise<SearchResult[]> {
  console.log('Searching for:', query);
  
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: 3,
      lang: 'en',
      scrapeOptions: { formats: ['markdown'] },
    }),
  });

  if (!response.ok) {
    console.error('Search failed:', response.status);
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

// Synthesize content using Lovable AI
async function synthesizeContent(
  sectionTitle: string,
  sources: SearchResult[],
  apiKey: string
): Promise<string> {
  const sourcesText = sources
    .map((s, i) => `Source ${i + 1} (${s.title || s.url}):\n${s.markdown || s.description || 'No content available'}`)
    .join('\n\n---\n\n');

  const prompt = `You are a market research expert writing content for a professional business audience. Based on the following web sources about "${sectionTitle}", write a comprehensive, well-structured section.

SOURCES:
${sourcesText}

REQUIREMENTS:
- Write 300-500 words of original, synthesized content
- Use professional business language appropriate for executives
- Include specific facts, statistics, and insights from the sources when available
- Structure with clear paragraphs and logical flow
- Do NOT include citations, references, or source attributions
- Do NOT use phrases like "according to sources" or "research shows"
- Write as authoritative original content
- Focus on actionable insights and practical information

Write the content now:`;

  console.log('Calling Lovable AI for synthesis...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'You are a professional market research writer specializing in international business and trade.' },
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI synthesis failed:', response.status, errorText);
    throw new Error(`AI synthesis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAdmin(req);
    if ("error" in authResult) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error.message }),
        { status: authResult.error.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { content_id, section_ids } = await req.json();

    if (!content_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'content_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lovable AI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch content item
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('id, title, slug')
      .eq('id', content_id)
      .single();

    if (contentError || !contentItem) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch sections to enrich
    let sectionsQuery = supabase
      .from('content_sections')
      .select('*')
      .eq('content_id', content_id)
      .order('sort_order');

    if (section_ids && section_ids.length > 0) {
      sectionsQuery = sectionsQuery.in('id', section_ids);
    }

    const { data: sections, error: sectionsError } = await sectionsQuery;

    if (sectionsError || !sections || sections.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No sections found to enrich' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enriching ${sections.length} sections for: ${contentItem.title}`);

    const results: { section: string; success: boolean; error?: string }[] = [];

    // Process each section
    for (const section of sections as ContentSection[]) {
      try {
        console.log(`\nProcessing section: ${section.title}`);

        // Generate search query
        const searchQuery = generateSearchQuery(section.title, contentItem.title);
        
        // Search the web
        const searchResults = await searchWeb(searchQuery, firecrawlKey);
        
        if (searchResults.length === 0) {
          console.log(`No search results for: ${section.title}`);
          results.push({ section: section.title, success: false, error: 'No search results found' });
          continue;
        }

        console.log(`Found ${searchResults.length} sources for: ${section.title}`);

        // Synthesize content using AI
        const synthesizedContent = await synthesizeContent(section.title, searchResults, lovableKey);

        if (!synthesizedContent) {
          results.push({ section: section.title, success: false, error: 'AI synthesis returned empty content' });
          continue;
        }

        // Insert into content_bodies
        const { error: insertError } = await supabase
          .from('content_bodies')
          .insert({
            content_id: content_id,
            section_id: section.id,
            body_text: synthesizedContent,
            body_markdown: synthesizedContent,
            content_type: 'enriched',
            sort_order: 1,
          });

        if (insertError) {
          console.error(`Failed to insert content for ${section.title}:`, insertError);
          results.push({ section: section.title, success: false, error: insertError.message });
        } else {
          console.log(`Successfully enriched: ${section.title}`);
          results.push({ section: section.title, success: true });
        }

        // Add delay between sections to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing section ${section.title}:`, error);
        results.push({ 
          section: section.title, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\nEnrichment complete: ${successCount}/${sections.length} sections enriched`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${successCount} of ${sections.length} sections`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Enrichment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to enrich content';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
