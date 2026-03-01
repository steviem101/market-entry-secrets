import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin } from "../_shared/auth.ts";
import { buildCorsHeaders } from "../_shared/http.ts";

interface Investor {
  id: string;
  name: string;
  website: string | null;
  basic_info: string | null;
  why_work_with_us: string | null;
}

interface EnrichmentResult {
  investor_id: string;
  investor_name: string;
  success: boolean;
  error?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const { investor_id, only_missing } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lovable API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('investors')
      .select('id, name, website, basic_info, why_work_with_us');

    if (investor_id) {
      query = query.eq('id', investor_id);
    }

    if (only_missing) {
      query = query.is('basic_info', null);
    }

    const { data: investors, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching investors:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!investors || investors.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No investors to enrich',
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${investors.length} investors...`);

    const results: EnrichmentResult[] = [];

    for (let i = 0; i < investors.length; i++) {
      const inv = investors[i] as Investor;
      console.log(`\n[${i + 1}/${investors.length}] Processing: ${inv.name}`);

      if (!inv.website) {
        console.log(`  Skipping - no website URL`);
        results.push({
          investor_id: inv.id,
          investor_name: inv.name,
          success: false,
          error: 'No website URL available'
        });
        continue;
      }

      try {
        console.log(`  Scraping: ${inv.website}`);

        let websiteUrl = inv.website.trim();
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          websiteUrl = `https://${websiteUrl}`;
        }

        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: websiteUrl,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        const scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error(`  Scrape failed:`, scrapeData.error || scrapeData);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: `Scrape failed: ${scrapeData.error || 'Unknown error'}`
          });

          if (i < investors.length - 1) {
            await delay(3000);
          }
          continue;
        }

        const scrapedContent = scrapeData.data?.markdown || scrapeData.markdown || '';

        if (!scrapedContent || scrapedContent.length < 100) {
          console.log(`  Insufficient content scraped (${scrapedContent.length} chars)`);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: 'Insufficient content scraped from website'
          });

          if (i < investors.length - 1) {
            await delay(3000);
          }
          continue;
        }

        console.log(`  Scraped ${scrapedContent.length} characters`);
        console.log(`  Synthesizing with AI...`);

        const aiPrompt = `You are analyzing the website of an Australian investor/fund called "${inv.name}".

Based on the following scraped content from their website, extract and write:

1. BASIC_INFO: A 2-3 paragraph professional overview of the investor, including their investment thesis, focus areas, notable portfolio companies, and what makes them unique. Write in third person. (200-300 words)

2. WHY_WORK_WITH_US: A concise paragraph (3-5 sentences) highlighting the key benefits for startups seeking funding from this investor — what value-add they provide beyond capital (mentorship, network, operational support, etc.).

Website content:
${scrapedContent.substring(0, 12000)}

Respond in valid JSON format only, no markdown code blocks:
{"basic_info": "...", "why_work_with_us": "..."}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a professional content writer specializing in venture capital and startup ecosystems. Always respond with valid JSON only, no markdown formatting.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`  AI synthesis failed:`, errorText);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: `AI synthesis failed: ${aiResponse.status}`
          });

          if (i < investors.length - 1) {
            await delay(3000);
          }
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content;

        if (!aiContent) {
          console.error(`  No AI content received`);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: 'No content generated by AI'
          });

          if (i < investors.length - 1) {
            await delay(3000);
          }
          continue;
        }

        let parsedContent;
        try {
          const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsedContent = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error(`  Failed to parse AI response:`, aiContent);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: 'Failed to parse AI response'
          });

          if (i < investors.length - 1) {
            await delay(3000);
          }
          continue;
        }

        console.log(`  Updating database...`);

        const { error: updateError } = await supabase
          .from('investors')
          .update({
            basic_info: parsedContent.basic_info,
            why_work_with_us: parsedContent.why_work_with_us,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inv.id);

        if (updateError) {
          console.error(`  Database update failed:`, updateError);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: false,
            error: `Database update failed: ${updateError.message}`
          });
        } else {
          console.log(`  Successfully enriched ${inv.name}`);
          results.push({
            investor_id: inv.id,
            investor_name: inv.name,
            success: true,
          });
        }

        if (i < investors.length - 1) {
          console.log(`  Waiting 3 seconds before next investor...`);
          await delay(3000);
        }

      } catch (error) {
        console.error(`  Error processing ${inv.name}:`, error);
        results.push({
          investor_id: inv.id,
          investor_name: inv.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (i < investors.length - 1) {
          await delay(3000);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\nEnrichment complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${successCount}/${results.length} investors`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-investors:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
