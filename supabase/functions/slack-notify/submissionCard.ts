// Rich Slack card helpers for `directory_submissions` activity events
// (submission.received / intro.requested). Pure + deterministic — no I/O, no
// token cost — so index.ts stays testable. See ./index.ts for wiring.

export interface CuratedField {
  label: string;
  value: string;
}

// Ordered, curated view over the freeform `form_data` blob. Multiple source
// keys can map to the same label (e.g. eventTitle/guideTitle/contentTitle ->
// "Title"); the first non-empty one wins so the card never repeats a label.
// Covers both the directory-submission funnels and the intro-request funnel.
export const SUBMISSION_FIELD_SPEC: ReadonlyArray<readonly [string, string]> = [
  ["name", "Contact"],
  ["organization", "Organisation"],
  ["eventTitle", "Title"],
  ["guideTitle", "Title"],
  ["contentTitle", "Title"],
  ["eventDate", "Event date"],
  ["eventTime", "Event time"],
  ["eventCategory", "Category"],
  ["location", "Location"],
  ["targetMarket", "Target market"],
  ["industry", "Industry"],
  ["website", "Website"],
  ["target_name", "Target"], // intro request
  ["requester_company", "Company"], // intro request
  ["useCase", "Use case"],
  ["description", "Details"],
  ["successStory", "Details"],
  ["dataRequirements", "Requirements"],
];

const MAX_VALUE_LEN = 280;
const MAX_FIELDS = 8;

function normaliseValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  const joined = Array.isArray(raw) ? raw.map((v) => String(v)).join(", ") : String(raw);
  const trimmed = joined.trim();
  if (trimmed.length <= MAX_VALUE_LEN) return trimmed;
  return trimmed.slice(0, MAX_VALUE_LEN - 1) + "…";
}

// Pick the most relevant non-empty fields from a submission's form_data, in
// SUBMISSION_FIELD_SPEC order, one line per label, capped at MAX_FIELDS.
export function curateSubmissionFields(
  formData: Record<string, unknown> | null | undefined,
): CuratedField[] {
  const out: CuratedField[] = [];
  const usedLabels = new Set<string>();
  const data = formData ?? {};
  for (const [key, label] of SUBMISSION_FIELD_SPEC) {
    if (usedLabels.has(label)) continue;
    const value = normaliseValue(data[key]);
    if (!value) continue;
    out.push({ label, value });
    usedLabels.add(label);
    if (out.length >= MAX_FIELDS) break;
  }
  return out;
}

// Deep link to the exact submission row in the Supabase table editor. The
// `filter` param pre-filters to the row; if a future Studio ignores it the link
// still lands on the directory_submissions table (and the id is on the card).
export function buildSubmissionEditorUrl(
  projectRef: string,
  tableId: string,
  rowId: string | null | undefined,
): string {
  if (!projectRef || !tableId || !rowId) return "";
  const base = `https://supabase.com/dashboard/project/${projectRef}/editor/${tableId}?schema=public`;
  return `${base}&filter=id%3Aeq%3A${encodeURIComponent(rowId)}`;
}

// Extract the Supabase project ref from the project URL (https://<ref>.supabase.co).
export function projectRefFromUrl(supabaseUrl: string | undefined | null): string {
  if (!supabaseUrl) return "";
  return supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? "";
}
