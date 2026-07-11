// MES-123 — CSV parsing + Lemlist/PhantomBuster header mapping (pure, unit-tested).
//
// Canonical column contract: full_name, linkedin_url, image_url (+ optional email, company).
// Either export source works unmodified: we map a broad set of header aliases (covering both
// Lemlist and PhantomBuster column names) to the canonical fields, and derive full_name from
// first/last name columns when there is no single name column.

export interface CsvContactRow {
  fullName: string;
  linkedinUrl: string;
  imageUrl: string;
  email: string;
  company: string;
  raw: Record<string, string>;
}

// Header alias sets (compared after stripping to lowercase alphanumerics). The union covers
// Lemlist (firstName/lastName/linkedinUrl/companyName/picture) and PhantomBuster LinkedIn
// exports (profileUrl/fullName/imgUrl/companyName), plus common generic variants.
const ALIASES: Record<string, string[]> = {
  linkedin_url: ["linkedinurl", "profileurl", "linkedin", "linkedinprofile", "linkedinprofileurl", "publicprofileurl", "linkedinlink"],
  image_url: ["imageurl", "imgurl", "profileimageurl", "profilepictureurl", "profilepicture", "picture", "pictureurl", "photo", "photourl", "avatar", "avatarurl", "image"],
  email: ["email", "emailaddress", "workemail", "email1", "primaryemail"],
  company: ["company", "companyname", "organization", "organisation", "currentcompany", "organizationname"],
  full_name: ["fullname", "name", "contactname"],
  first_name: ["firstname", "first", "givenname"],
  last_name: ["lastname", "last", "surname", "familyname"],
};

const normHeader = (h: string): string => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * RFC4180-ish CSV parser: handles quoted fields, embedded commas/newlines, and "" escaping.
 * Returns the header row and data rows as raw string cells.
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  // Normalise CRLF/CR to LF first so newline handling is uniform.
  const s = text.replace(/\r\n?/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  // Flush trailing field/row (files without a final newline).
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  // Drop fully-empty trailing rows.
  const cleaned = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (cleaned.length === 0) return { headers: [], rows: [] };
  const [headers, ...data] = cleaned;
  return { headers: headers.map((h) => h.trim()), rows: data };
}

/** Map header names -> column index for each canonical/aux field we understand. */
export function mapHeaders(headers: string[]): Record<string, number> {
  const normalized = headers.map(normHeader);
  const out: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx >= 0) out[field] = idx;
  }
  return out;
}

/**
 * Parse a full CSV export into canonical contact rows. Empty rows are dropped; full_name is
 * derived from first/last when there is no single name column. No validation here — the caller
 * (which owns the staging statuses) decides what counts as unusable.
 */
export function buildContactRows(text: string): { rows: CsvContactRow[]; mapping: Record<string, number> } {
  const { headers, rows } = parseCsv(text);
  const mapping = mapHeaders(headers);
  const at = (cells: string[], field: string): string => {
    const i = mapping[field];
    return i === undefined ? "" : (cells[i] ?? "").trim();
  };

  const out: CsvContactRow[] = [];
  for (const cells of rows) {
    let fullName = at(cells, "full_name");
    if (!fullName) {
      fullName = `${at(cells, "first_name")} ${at(cells, "last_name")}`.trim();
    }
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => { raw[h] = (cells[i] ?? "").trim(); });

    out.push({
      fullName,
      linkedinUrl: at(cells, "linkedin_url"),
      imageUrl: at(cells, "image_url"),
      email: at(cells, "email"),
      company: at(cells, "company"),
      raw,
    });
  }
  return { rows: out, mapping };
}
