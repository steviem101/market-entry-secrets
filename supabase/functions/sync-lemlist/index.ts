import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Lemlist API helpers ────────────────────────────────────────────────

function lemlistHeaders(apiKey: string): Record<string, string> {
  // Lemlist uses Basic Auth with the API key as the password
  const encoded = btoa(`:${apiKey}`);
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

async function fetchAllPaginated(
  baseUrl: string,
  headers: Record<string, string>,
  label: string
): Promise<any[]> {
  const all: any[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
    console.log(`Fetching ${label}: offset=${offset}`);

    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Lemlist ${label} fetch error: ${resp.status}`, text);
      break;
    }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;

    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }

  console.log(`Fetched ${all.length} ${label} total`);
  return all;
}

// ── Transform helpers ──────────────────────────────────────────────────

function transformCompany(raw: any) {
  return {
    lemlist_id: raw._id,
    name: raw.name || raw.companyName || "Unknown",
    domain: raw.domain || raw.website || null,
    industry: raw.industry || raw.fields?.industry || null,
    size: raw.size || raw.numberOfEmployees || raw.fields?.companySize || null,
    location:
      raw.city || raw.country
        ? [raw.city, raw.state, raw.country].filter(Boolean).join(", ")
        : raw.fields?.location || null,
    linkedin_url: raw.linkedinUrl || raw.linkedin || raw.fields?.linkedinUrl || null,
    fields: raw.fields || {},
    owner_id: raw.ownerId || null,
    lemlist_created_at: raw.createdAt || null,
    updated_at: new Date().toISOString(),
  };
}

function transformContact(raw: any) {
  const firstName = raw.firstName || raw.fields?.firstName || "";
  const lastName = raw.lastName || raw.fields?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || raw.name || null;

  return {
    lemlist_id: raw._id,
    full_name: fullName,
    first_name: firstName || null,
    last_name: lastName || null,
    email: raw.email || null,
    job_title: raw.jobTitle || raw.fields?.jobTitle || null,
    phone: raw.phone || raw.fields?.phone || null,
    linkedin_url: raw.linkedinUrl || raw.fields?.linkedinUrl || null,
    industry: raw.industry || raw.fields?.industry || null,
    lifecycle_status: raw.lifecycleStatus || raw.fields?.lifecycleStatus || null,
    campaigns: raw.campaigns || [],
    fields: raw.fields || {},
    owner_id: raw.ownerId || null,
    lemlist_created_at: raw.createdAt || null,
    // company linking fields (used for matching, not stored directly)
    _companyName: raw.companyName || raw.fields?.companyName || null,
    _companyDomain: raw.companyDomain || raw.fields?.companyDomain || null,
    _companyId: raw.companyId || null,
    updated_at: new Date().toISOString(),
  };
}

// ── Main handler ───────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const lemlistKey = Deno.env.get("LEMLIST_API_KEY");
    if (!lemlistKey) {
      throw new Error("LEMLIST_API_KEY secret is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const headers = lemlistHeaders(lemlistKey);
    const stats = { companies_synced: 0, contacts_synced: 0, contacts_linked: 0, errors: [] as string[] };

    // ── Step 1: Sync companies ───────────────────────────────────────
    console.log("Step 1: Fetching companies from Lemlist...");
    const rawCompanies = await fetchAllPaginated(
      "https://api.lemlist.com/api/companies",
      headers,
      "companies"
    );

    // Build a map of lemlist company _id → supabase uuid for linking contacts
    const companyIdMap = new Map<string, string>();

    for (const raw of rawCompanies) {
      try {
        const company = transformCompany(raw);

        const { data, error } = await supabase
          .from("lemlist_companies")
          .upsert(company, { onConflict: "lemlist_id" })
          .select("id, lemlist_id")
          .single();

        if (error) {
          console.error(`Upsert company ${company.name}:`, error.message);
          stats.errors.push(`Company ${company.name}: ${error.message}`);
          continue;
        }

        companyIdMap.set(raw._id, data.id);
        stats.companies_synced++;
      } catch (e) {
        console.error(`Transform company error:`, e);
      }
    }

    console.log(`Companies synced: ${stats.companies_synced}`);

    // Also load existing company mappings for domain-based linking
    const { data: existingCompanies } = await supabase
      .from("lemlist_companies")
      .select("id, lemlist_id, domain, name");

    const domainToCompanyId = new Map<string, string>();
    const nameToCompanyId = new Map<string, string>();
    for (const c of existingCompanies || []) {
      companyIdMap.set(c.lemlist_id, c.id);
      if (c.domain) domainToCompanyId.set(c.domain.toLowerCase(), c.id);
      if (c.name) nameToCompanyId.set(c.name.toLowerCase(), c.id);
    }

    // ── Step 2: Sync contacts ────────────────────────────────────────
    console.log("Step 2: Fetching contacts from Lemlist...");
    const rawContacts = await fetchAllPaginated(
      "https://api.lemlist.com/api/contacts",
      headers,
      "contacts"
    );

    for (const raw of rawContacts) {
      try {
        const contact = transformContact(raw);

        // Try to link to a company
        let companyId: string | null = null;

        // Priority 1: Direct Lemlist company ID reference
        if (contact._companyId && companyIdMap.has(contact._companyId)) {
          companyId = companyIdMap.get(contact._companyId)!;
        }
        // Priority 2: Match by domain
        else if (contact._companyDomain) {
          const domain = contact._companyDomain.toLowerCase().replace(/^www\./, "");
          companyId = domainToCompanyId.get(domain) || null;
        }
        // Priority 3: Match by company name
        else if (contact._companyName) {
          companyId = nameToCompanyId.get(contact._companyName.toLowerCase()) || null;
        }

        // Remove internal linking fields before upsert
        const { _companyName, _companyDomain, _companyId, ...contactData } = contact;

        const upsertData = {
          ...contactData,
          company_id: companyId,
        };

        const { error } = await supabase
          .from("lemlist_contacts")
          .upsert(upsertData, { onConflict: "lemlist_id" });

        if (error) {
          console.error(`Upsert contact ${contact.full_name}:`, error.message);
          stats.errors.push(`Contact ${contact.full_name}: ${error.message}`);
          continue;
        }

        stats.contacts_synced++;
        if (companyId) stats.contacts_linked++;
      } catch (e) {
        console.error(`Transform contact error:`, e);
      }
    }

    console.log(`Contacts synced: ${stats.contacts_synced}, linked: ${stats.contacts_linked}`);

    const duration = Date.now() - startTime;
    console.log(`Sync completed in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        ...stats,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync-lemlist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
