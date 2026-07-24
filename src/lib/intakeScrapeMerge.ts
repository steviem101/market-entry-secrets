/**
 * Pure merge + provenance logic for the Step 1 website-scrape prefill (MES-226).
 *
 * The scrape is a SUGGESTION that must never clobber user-typed values — but
 * values placed by an EARLIER scrape are not user input, so when the user
 * switches to another company they must not survive either. The component can't
 * tell the two apart from form state alone, so every merge returns a provenance
 * map recording exactly which fields the scrape populated (and with what), and
 * `clearScrapedFields` later resets only fields the user hasn't edited since.
 */

export interface ScrapePrefill {
  company_name?: string;
  industry_sector?: string[];
  country_of_origin?: string;
  company_stage?: string;
  employee_count?: string;
}

export type ScrapeField = keyof ScrapePrefill;

/** Serialised value each scraped field was set to, keyed by field. */
export type ScrapeProvenance = Partial<Record<ScrapeField, string>>;

export interface ScrapeFormSlice {
  company_name?: string;
  industry_sector?: string[];
  country_of_origin?: string;
  company_stage?: string;
  employee_count?: string;
}

const serialise = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? JSON.stringify(v) : (v ?? '');

/**
 * Hostname-ish domain from a loosely-typed URL field (protocol optional,
 * `www.` stripped, path/query dropped, lowercased). Null when nothing
 * domain-like is present.
 */
export function extractDomain(raw: string | undefined | null): string | null {
  const t = (raw ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  const host = t.split(/[/?#]/, 1)[0];
  if (!host || !host.includes('.') || host.endsWith('.')) return null;
  return host;
}

/** True when both URLs carry a parseable domain and they differ. */
export function isMaterialDomainChange(prevUrl: string | null | undefined, nextUrl: string | null | undefined): boolean {
  const prev = extractDomain(prevUrl);
  const next = extractDomain(nextUrl);
  return !!prev && !!next && prev !== next;
}

export interface MergeOutcome {
  patch: ScrapeFormSlice;
  /** Fields this scrape populated, with the serialised value it set. */
  provenance: ScrapeProvenance;
  /** Which fields to badge as AI-detected in the confirm card. */
  aiFields: Partial<Record<ScrapeField, boolean>>;
  /** A required field is still empty after the merge (expand the full form). */
  missingRequired: boolean;
}

/**
 * Suggestion-merge semantics (unchanged from the original flow, minus the
 * premature `website_scrape_accepted`): company_name fills only when currently
 * empty; the other fields take the scrape's value when present and keep the
 * existing value otherwise.
 */
export function mergeScrapeResult(form: ScrapeFormSlice, result: ScrapePrefill): MergeOutcome {
  const mergedName = form.company_name || result.company_name || '';
  const mergedCountry = result.country_of_origin ?? form.country_of_origin;
  const mergedIndustry = result.industry_sector ?? form.industry_sector;
  const mergedStage = result.company_stage ?? form.company_stage;
  const mergedEmployees = result.employee_count ?? form.employee_count;

  const provenance: ScrapeProvenance = {};
  if (!form.company_name && result.company_name) provenance.company_name = serialise(mergedName);
  if (result.country_of_origin) provenance.country_of_origin = serialise(mergedCountry);
  if (result.industry_sector && result.industry_sector.length > 0) provenance.industry_sector = serialise(mergedIndustry);
  if (result.company_stage) provenance.company_stage = serialise(mergedStage);
  if (result.employee_count) provenance.employee_count = serialise(mergedEmployees);

  return {
    patch: {
      company_name: mergedName,
      country_of_origin: mergedCountry,
      industry_sector: mergedIndustry,
      company_stage: mergedStage,
      employee_count: mergedEmployees,
    },
    provenance,
    aiFields: {
      company_name: 'company_name' in provenance,
      country_of_origin: 'country_of_origin' in provenance,
      industry_sector: 'industry_sector' in provenance,
      company_stage: 'company_stage' in provenance,
      employee_count: 'employee_count' in provenance,
    },
    missingRequired: !mergedName || !mergedCountry || !(mergedIndustry ?? []).length || !mergedStage,
  };
}

/**
 * Reset the fields a previous scrape populated, keeping any the user has since
 * edited (current value no longer matches what the scrape set).
 */
export function clearScrapedFields(form: ScrapeFormSlice, provenance: ScrapeProvenance): ScrapeFormSlice {
  const patch: ScrapeFormSlice = {};
  if (provenance.company_name !== undefined && serialise(form.company_name) === provenance.company_name) {
    patch.company_name = '';
  }
  if (provenance.country_of_origin !== undefined && serialise(form.country_of_origin) === provenance.country_of_origin) {
    patch.country_of_origin = '';
  }
  if (provenance.industry_sector !== undefined && serialise(form.industry_sector) === provenance.industry_sector) {
    patch.industry_sector = [];
  }
  if (provenance.company_stage !== undefined && serialise(form.company_stage) === provenance.company_stage) {
    patch.company_stage = undefined;
  }
  if (provenance.employee_count !== undefined && serialise(form.employee_count) === provenance.employee_count) {
    patch.employee_count = undefined;
  }
  return patch;
}

/** Persisted scrape metadata so the provenance survives leave-and-return. */
export interface ScrapeMeta {
  domain: string;
  provenance: ScrapeProvenance;
}

export const SCRAPE_META_KEY = 'mes_intake_v2_scrape_meta';

export function parseScrapeMeta(raw: string | null): ScrapeMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScrapeMeta;
    if (typeof parsed?.domain !== 'string' || !parsed.domain) return null;
    return { domain: parsed.domain, provenance: parsed.provenance ?? {} };
  } catch {
    return null;
  }
}
