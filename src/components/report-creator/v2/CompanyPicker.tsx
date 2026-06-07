/**
 * CompanyPicker — a single autocomplete field for "companies you sell to" and
 * "known competitors". Type a name OR paste a website; pick a directory
 * suggestion or "Add anyway". Value is the unchanged {name, website} shape;
 * website is filled by selection or a pasted domain, else left blank for the
 * backend to resolve at generate time (P1.5 / Phase 4).
 *
 * Phase 2 sources suggestions from COMPANY_DIRECTORY_SEED. Phase 4 swaps this
 * for a type-ahead against the AU directory tables.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { RcIcon } from './icons';
import { RcTextInput } from './primitives';
import { searchCompanyDirectory } from './companyDirectory';
import type { DirectoryCompany } from './rcData';

export interface CompanyRow { name: string; website: string }

const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const cleanDomain = (s: string) => s.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
const nameFromDomain = (d: string) => {
  const base = cleanDomain(d).split('.')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export function CompanyPicker({
  rows, onChange, max, placeholder, onCustomAdded,
}: {
  rows: CompanyRow[];
  onChange: (next: CompanyRow[]) => void;
  max: number;
  placeholder: string;
  /** Fired when a name not in the directory is added (analytics seam, P1.5). */
  onCustomAdded?: (name: string) => void;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<DirectoryCompany[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const query = q.trim();
  const lc = query.toLowerCase();
  const chosen = new Set(rows.map((r) => (r.name || '').toLowerCase()));

  // Debounced type-ahead against the AU directory tables (+ seed).
  useEffect(() => {
    if (lc.length < 2) { setSuggestions([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const results = await searchCompanyDirectory(query);
      if (!cancelled) setSuggestions(results);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, lc.length]);

  // Click outside / Escape closes the dropdown.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const matches = suggestions.filter((c) => !chosen.has(c.name.toLowerCase())).slice(0, 6);
  const exact = suggestions.some((c) => c.name.toLowerCase() === lc);
  const atCap = rows.length >= max;
  const looksLikeUrl = URL_RE.test(query);

  function add(entry: CompanyRow, fromDirectory: boolean) {
    if (rows.length >= max) return;
    if (chosen.has((entry.name || '').toLowerCase())) return;
    onChange([...rows, entry]);
    if (!fromDirectory && entry.name) onCustomAdded?.(entry.name);
    setQ('');
    setOpen(false);
  }

  function addTyped() {
    if (!query) return;
    if (looksLikeUrl) add({ name: nameFromDomain(query), website: cleanDomain(query) }, false);
    else add({ name: query, website: '' }, false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[0]) add({ name: matches[0].name, website: matches[0].website }, true);
      else addTyped();
    }
  }

  return (
    <div ref={rootRef} className="space-y-2">
      {rows.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {rows.map((c, i) => (
            <li key={`${c.name}-${i}`} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-rc-line bg-white py-1.5 pl-2.5 pr-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rc-sky-soft text-[11px] font-bold text-rc-primary">
                {(c.name || '?').slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 max-w-[150px]">
                <span className="block truncate text-[13px] font-semibold leading-tight text-rc-ink">{c.name}</span>
                <span className="block truncate text-[11px] leading-tight text-rc-muted">
                  {c.website ? c.website : 'add a website ↑ for a better match'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${c.name}`}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-rc-muted hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
              >
                <RcIcon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {atCap ? (
        <p className="flex items-center gap-1.5 text-[12px] text-rc-muted">
          <RcIcon name="check" size={13} /> Maximum of {max} added — remove one to change.
        </p>
      ) : (
        <div className="relative">
          <RcTextInput
            iconLeft="search"
            placeholder={placeholder}
            value={q}
            ariaLabel={placeholder}
            onChange={(v) => { setQ(v); setOpen(true); }}
            onKeyDown={onKeyDown}
          />
          {open && query && (
            <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-rc-line bg-white shadow-rc-pop">
              {matches.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => add({ name: c.name, website: c.website }, true)}
                  className="flex h-12 w-full items-center gap-2.5 border-b border-rc-line/60 px-3 text-left last:border-0 hover:bg-rc-sky-tint"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rc-sky-soft text-[12px] font-bold text-rc-primary">{c.name.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-rc-ink">{c.name}</span>
                    <span className="block truncate text-[11.5px] text-rc-muted">{c.website}</span>
                  </span>
                  <RcIcon name="plus" size={15} className="shrink-0 text-rc-primary" />
                </button>
              ))}
              {!exact && (
                <button
                  type="button"
                  onClick={addTyped}
                  className="flex h-11 w-full items-center gap-2.5 px-3 text-left font-medium text-rc-primary-700 hover:bg-rc-sky-tint"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rc-sky-soft"><RcIcon name={looksLikeUrl ? 'link' : 'plus'} size={15} /></span>
                  <span className="min-w-0 truncate text-[13.5px]">
                    {looksLikeUrl
                      ? <>Add website <span className="font-semibold">{cleanDomain(query)}</span></>
                      : <>Add “{query}” — add its website for a better match</>}
                  </span>
                </button>
              )}
              {!matches.length && exact && (
                <div className="flex h-11 items-center px-3 text-[13px] text-rc-muted">Already added above.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
