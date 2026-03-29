import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin } from "../_shared/auth.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { validateExternalUrl } from "../_shared/url.ts";
import { sanitizeScrapedContent } from "../_shared/sanitize.ts";

interface Organization {
  id: string;
  name: string;
  website: string | null;
  basic_info: string | null;
  why_work_with_us: string | null;
  founded: string;
  employees: string;
  logo: string | null;
  location: string;
  contact: string | null;
}

interface EnrichmentResult {
  organization_id: string;
  organization_name: string;
  success: boolean;
  fields_updated?: string[];
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

    let organization_id: string | undefined;
    let only_missing: boolean | undefined;
    let batch_size: number | undefined;
    try {
      const body = await req.json();
      organization_id = body.organization_id;
      only_missing = body.only_missing;
      batch_size = body.batch_size;
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Build query based on parameters
    let query = supabase
      .from('innovation_ecosystem')
      .select('id, name, website, basic_info, why_work_with_us, founded, employees, logo, location, contact');

    if (organization_id) {
      query = query.eq('id', organization_id);
    }

    if (only_missing) {
      // Target records missing multiple fields (truly sparse), not records just missing a logo
      // founded='' AND employees='' identifies bulk-imported sparse records
      query = query.eq('founded', '').eq('employees', '');
    }

    // Apply batch size limit (default 10 to stay within edge function timeout)
    const limit = batch_size && batch_size > 0 ? Math.min(batch_size, 50) : 10;
    query = query.limit(limit);

    const { data: organizations, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching organizations:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!organizations || organizations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No organizations to enrich',
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${organizations.length} organizations...`);

    const results: EnrichmentResult[] = [];

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i] as Organization;
      console.log(`\n[${i + 1}/${organizations.length}] Processing: ${org.name}`);

      if (!org.website) {
        console.log(`  Skipping - no website URL`);
        results.push({
          organization_id: org.id,
          organization_name: org.name,
          success: false,
          error: 'No website URL available'
        });
        continue;
      }

      try {
        // Step 1: Scrape the website using Firecrawl
        console.log(`  Scraping: ${org.website}`);

        const websiteUrl = validateExternalUrl(org.website);

        const scrapeController = new AbortController();
        const scrapeTimeout = setTimeout(() => scrapeController.abort(), 30000);
        let scrapeResponse: Response;
        try {
          scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
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
            signal: scrapeController.signal,
          });
        } finally {
          clearTimeout(scrapeTimeout);
        }

        const scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error(`  Scrape failed:`, scrapeData.error || scrapeData);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: `Scrape failed: ${scrapeData.error || 'Unknown error'}`
          });

          if (i < organizations.length - 1) {
            await delay(3000);
          }
          continue;
        }

        const scrapedContent = scrapeData.data?.markdown || scrapeData.markdown || '';
        const scrapedMetadata = scrapeData.data?.metadata || {};

        if (!scrapedContent || scrapedContent.length < 100) {
          console.log(`  Insufficient content scraped (${scrapedContent.length} chars)`);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: 'Insufficient content scraped from website'
          });

          if (i < organizations.length - 1) {
            await delay(3000);
          }
          continue;
        }

        console.log(`  Scraped ${scrapedContent.length} characters`);

        // Step 2: Use AI to synthesize the content — extract all fields
        console.log(`  Synthesizing with AI...`);

        // Determine which fields need enrichment
        const needsBasicInfo = !org.basic_info;
        const needsWhyWork = !org.why_work_with_us;
        const needsFounded = !org.founded;
        const needsEmployees = !org.employees;
        const needsLogo = !org.logo;
        const needsLocation = org.location === 'Australia'; // generic location
        const needsContact = !org.contact;

        const aiPrompt = `You are analyzing the website of an innovation organization in Australia called "${org.name}".
Their current location on record is: "${org.location}".

Based on the following scraped content from their website, extract the following information.
Only include fields where you can find reliable information. If you cannot determine a field, set it to null.

Fields to extract:
${needsBasicInfo ? '1. BASIC_INFO: A 2-3 paragraph professional overview of the organization, including their mission, focus areas, key offerings, and what makes them unique. Write in third person. (200-300 words)' : ''}
${needsWhyWork ? '2. WHY_WORK_WITH_US: A concise paragraph (3-5 sentences) highlighting the key benefits and value propositions for startups, entrepreneurs, or companies working with this organization.' : ''}
${needsFounded ? '3. FOUNDED: The year the organization was founded/established (just the 4-digit year, e.g. "2018"). Look for phrases like "founded in", "established", "since", "launched in".' : ''}
${needsEmployees ? '4. EMPLOYEES: The approximate team/employee count range. Use standard ranges: "1-10", "11-50", "51-200", "201-500", "500+". Look for "team of", "employees", "staff".' : ''}
${needsLogo ? '5. LOGO_URL: The URL of the organization\'s logo image if visible on the page. Must be a full absolute URL starting with http. Look for og:image meta tag, logo in header, or favicon. Prefer SVG or PNG.' : ''}
${needsLocation ? '6. CITY_LOCATION: The specific city and state where the organization is headquartered, in format "City, STATE_ABBREV" (e.g. "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD"). Look for addresses, "located in", "based in", contact pages.' : ''}
${needsContact ? '7. CONTACT_EMAIL: A general contact email address for the organization. Look for info@, hello@, contact@, or general enquiry emails.' : ''}

Website content:
${sanitizeScrapedContent(scrapedContent, 12000)}

Respond in valid JSON format only, no markdown code blocks:
{${needsBasicInfo ? '"basic_info": "..." or null,' : ''}${needsWhyWork ? '"why_work_with_us": "..." or null,' : ''}${needsFounded ? '"founded": "YYYY" or null,' : ''}${needsEmployees ? '"employees": "range" or null,' : ''}${needsLogo ? '"logo_url": "https://..." or null,' : ''}${needsLocation ? '"city_location": "City, ST" or null,' : ''}${needsContact ? '"contact_email": "email" or null,' : ''}"_done": true}`;

        const aiController = new AbortController();
        const aiTimeout = setTimeout(() => aiController.abort(), 30000);
        let aiResponse: Response;
        try {
          aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a professional data extraction assistant. Always respond with valid JSON only, no markdown formatting. Extract only factual information visible in the provided content.' },
                { role: 'user', content: aiPrompt }
              ],
              temperature: 0.3,
            }),
            signal: aiController.signal,
          });
        } finally {
          clearTimeout(aiTimeout);
        }

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`  AI synthesis failed:`, errorText);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: `AI synthesis failed: ${aiResponse.status}`
          });

          if (i < organizations.length - 1) {
            await delay(3000);
          }
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content;

        if (!aiContent) {
          console.error(`  No AI content received`);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: 'No content generated by AI'
          });

          if (i < organizations.length - 1) {
            await delay(3000);
          }
          continue;
        }

        // Parse the JSON response
        let parsedContent: Record<string, string | null>;
        try {
          const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsedContent = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error(`  Failed to parse AI response:`, aiContent);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: 'Failed to parse AI response'
          });

          if (i < organizations.length - 1) {
            await delay(3000);
          }
          continue;
        }

        // Step 3: Build update object — only update fields that were missing AND AI provided
        const updateData: Record<string, string> = {};
        const fieldsUpdated: string[] = [];

        if (needsBasicInfo && parsedContent.basic_info) {
          updateData.basic_info = parsedContent.basic_info;
          fieldsUpdated.push('basic_info');
        }
        if (needsWhyWork && parsedContent.why_work_with_us) {
          updateData.why_work_with_us = parsedContent.why_work_with_us;
          fieldsUpdated.push('why_work_with_us');
        }
        if (needsFounded && parsedContent.founded && /^\d{4}$/.test(parsedContent.founded)) {
          updateData.founded = parsedContent.founded;
          fieldsUpdated.push('founded');
        }
        if (needsEmployees && parsedContent.employees) {
          updateData.employees = parsedContent.employees;
          fieldsUpdated.push('employees');
        }
        if (needsLogo && parsedContent.logo_url && parsedContent.logo_url.startsWith('http')) {
          updateData.logo = parsedContent.logo_url;
          fieldsUpdated.push('logo');
        }
        // Also try Firecrawl's og:image metadata as logo fallback
        if (needsLogo && !updateData.logo && scrapedMetadata.ogImage && scrapedMetadata.ogImage.startsWith('http')) {
          updateData.logo = scrapedMetadata.ogImage;
          fieldsUpdated.push('logo');
        }
        if (needsLocation && parsedContent.city_location && parsedContent.city_location !== 'Australia') {
          updateData.location = parsedContent.city_location;
          fieldsUpdated.push('location');
        }
        if (needsContact && parsedContent.contact_email && parsedContent.contact_email.includes('@')) {
          updateData.contact = parsedContent.contact_email;
          fieldsUpdated.push('contact');
        }

        if (fieldsUpdated.length === 0) {
          console.log(`  No new fields extracted for ${org.name}`);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: true,
            fields_updated: [],
          });

          if (i < organizations.length - 1) {
            await delay(2000);
          }
          continue;
        }

        // Step 4: Update the database
        console.log(`  Updating ${fieldsUpdated.length} fields: ${fieldsUpdated.join(', ')}`);
        updateData.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('innovation_ecosystem')
          .update(updateData)
          .eq('id', org.id);

        if (updateError) {
          console.error(`  Database update failed:`, updateError);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: false,
            error: `Database update failed: ${updateError.message}`
          });
        } else {
          console.log(`  ✓ Successfully enriched ${org.name} (${fieldsUpdated.join(', ')})`);
          results.push({
            organization_id: org.id,
            organization_name: org.name,
            success: true,
            fields_updated: fieldsUpdated,
          });
        }

        // Wait before processing next organization
        if (i < organizations.length - 1) {
          console.log(`  Waiting 3 seconds before next organization...`);
          await delay(3000);
        }

      } catch (error) {
        console.error(`  Error processing ${org.name}:`, error);
        results.push({
          organization_id: org.id,
          organization_name: org.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (i < organizations.length - 1) {
          await delay(3000);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalFieldsUpdated = results.reduce((acc, r) => acc + (r.fields_updated?.length || 0), 0);

    console.log(`\nEnrichment complete: ${successCount} succeeded, ${failCount} failed, ${totalFieldsUpdated} fields updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${successCount}/${results.length} organizations (${totalFieldsUpdated} fields updated)`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-innovation-ecosystem:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
