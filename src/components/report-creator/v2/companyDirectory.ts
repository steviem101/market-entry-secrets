/**
 * CompanyPicker type-ahead source (P1.5). Queries the AU directory tables that
 * already carry domains (service_providers, investors, innovation_ecosystem),
 * merged with the curated seed so well-known companies still surface. Returns
 * {name, website} suggestions; names added without a website are resolved to a
 * domain server-side at generate time (resolveDomainFromName in generate-report).
 */
import { supabase } from '@/integrations/supabase/client';
import { COMPANY_DIRECTORY_SEED, type DirectoryCompany } from './rcData';

const cleanDomain = (w: string | null | undefined) =>
  (w || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');

type NameWebsite = { name: string | null; website: string | null };

async function safeRows(p: PromiseLike<{ data: NameWebsite[] | null }>): Promise<NameWebsite[]> {
  try {
    const r = await p;
    return r.data ?? [];
  } catch {
    return [];
  }
}

export async function searchCompanyDirectory(query: string): Promise<DirectoryCompany[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const like = `%${q}%`;
  const lc = q.toLowerCase();

  const [sp, inv, ie] = await Promise.all([
    safeRows(supabase.from('service_providers').select('name, website').ilike('name', like).limit(6)),
    safeRows(supabase.from('investors').select('name, website').ilike('name', like).limit(6)),
    safeRows(supabase.from('innovation_ecosystem').select('name, website').ilike('name', like).limit(6)),
  ]);

  const seedMatches = COMPANY_DIRECTORY_SEED.filter((c) => c.name.toLowerCase().includes(lc));

  const merged: DirectoryCompany[] = [
    ...[...sp, ...inv, ...ie].map((r) => ({ name: (r.name ?? '').trim(), website: cleanDomain(r.website) })),
    ...seedMatches,
  ].filter((c) => c.name);

  // Dedupe by lowercased name (DB before seed), cap 8.
  const seen = new Set<string>();
  const out: DirectoryCompany[] = [];
  for (const c of merged) {
    const k = c.name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= 8) break;
  }
  return out;
}
