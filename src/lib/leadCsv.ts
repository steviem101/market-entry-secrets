/**
 * Client-side CSV export for a buyer's delivered lead records (MES-198 / T7 D-B).
 * Pure + tested — the download wiring lives in the component. RFC-4180 quoting so
 * commas / quotes / newlines in a field can't corrupt the row.
 */
import type { LeadDatabaseRecord } from '@/types/leadDatabase';

interface CsvColumn {
  header: string;
  get: (r: LeadDatabaseRecord) => unknown;
}

// The columns worth exporting, in a sensible order. Arrays are joined; nullish
// renders empty.
const COLUMNS: CsvColumn[] = [
  { header: 'Company', get: (r) => r.company_name },
  { header: 'Contact', get: (r) => r.contact_name },
  { header: 'Job title', get: (r) => r.job_title },
  { header: 'Email', get: (r) => r.email },
  { header: 'Phone', get: (r) => r.phone },
  { header: 'LinkedIn', get: (r) => r.linkedin_url },
  { header: 'Website', get: (r) => r.website_url },
  { header: 'Sector', get: (r) => r.sector },
  { header: 'City', get: (r) => r.city },
  { header: 'State', get: (r) => r.state },
  { header: 'Country', get: (r) => r.country },
  { header: 'Revenue range', get: (r) => r.revenue_range },
  { header: 'Employees', get: (r) => r.employee_count_range },
  { header: 'Founded', get: (r) => r.founded_year },
  { header: 'Buying signals', get: (r) => r.buying_signals },
  { header: 'Technologies', get: (r) => r.technologies_used },
];

/** RFC-4180 field quoting: wrap in quotes and double any embedded quote when the
 * value contains a comma, quote, or newline. */
export function csvEscape(value: unknown): string {
  const s = value == null
    ? ''
    : Array.isArray(value)
      ? value.join('; ')
      : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build the full CSV text (header row + one row per record). */
export function recordsToCsv(records: LeadDatabaseRecord[]): string {
  const header = COLUMNS.map((c) => csvEscape(c.header)).join(',');
  const rows = records.map((r) => COLUMNS.map((c) => csvEscape(c.get(r))).join(','));
  return [header, ...rows].join('\r\n');
}

/** A filesystem-safe CSV filename derived from the list title. */
export function csvFilename(title: string | null | undefined): string {
  const slug = (title || 'lead-list')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'lead-list';
  return `${slug}.csv`;
}
