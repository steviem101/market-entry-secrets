/* ============================================================
   rc-ui.jsx — icon set + shared primitives
   ============================================================ */
const { useState, useRef, useEffect } = React;

// ── Icon set (simple lucide-style stroked paths) ───────────────────────
const ICON_PATHS = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3 0zM12 15l-3-3a22 22 0 0 1 8-10c2.5 0 4 1.5 4 4a22 22 0 0 1-10 8z"/><path d="M9 12H4s.5-2.8 2-4 5 0 5 0M12 15v5s2.8-.5 4-2 0-5 0-5"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h0M9 12h0M9 16h0M15 8h0M15 12h0M15 16h0"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 6M18.5 20a5.5 5.5 0 0 0-3-5"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 4.2a6 6 0 0 1 0 11.6M9 6.5v5M7 8.5h2.5a1.5 1.5 0 0 1 0 3H7"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 20.5zM5 4.5v16"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.5 12l2 2 3.5-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  landmark: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M12 3l8 5H4z"/>',
  calendar: '<rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 14l.9 2.3 2.3.9-2.3.9L18 20l-.9-2.3L14.8 17l2.3-.9z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M16.5 4.5l3 3L8 19l-4 1 1-4zM14.5 6.5l3 3"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  dollar: '<path d="M12 2v20M16.5 6.5A4 4 0 0 0 13 5h-2a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-2a4 4 0 0 1-3.5-1.5"/>',
  swords: '<path d="M14.5 14.5L20 20l-1.5 1.5L13 16M9.5 9.5L4 4l-1.5 1.5L8 11M3 17l4-4M21 7l-4 4M5 21l3-3M19 3l-3 3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  mapPin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  link: '<path d="M9 15l6-6M10.5 7l1.2-1.2a4 4 0 0 1 5.7 5.7L16 12.7M13.5 17l-1.2 1.2a4 4 0 0 1-5.7-5.7L8 10.3"/>',
  lightbulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
};

function Icon({ name, className = '', size = 20, strokeWidth = 1.75 }) {
  const d = ICON_PATHS[name] || '';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: d }} />
  );
}

// ── Icon badge (pale circle behind a glyph) ────────────────────────────
function IconBadge({ name, size = 'md' }) {
  const dim = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const ico = size === 'lg' ? 26 : size === 'sm' ? 18 : 22;
  return (
    <div className={`${dim} rounded-full bg-sky-soft flex items-center justify-center text-primary shrink-0`}>
      <Icon name={name} size={ico} />
    </div>
  );
}

// ── Primary / secondary buttons ────────────────────────────────────────
function PrimaryButton({ children, onClick, className = '', icon = 'arrowRight', iconLeft, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 h-12 text-[15px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {iconLeft && <Icon name={iconLeft} size={18} />}
      {children}
      {icon && !iconLeft && <Icon name={icon} size={18} />}
    </button>
  );
}

function GhostButton({ children, onClick, className = '', icon = 'arrowLeft' }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 h-12 text-[15px] font-semibold text-body border border-line bg-white hover:bg-canvas transition-colors ${className}`}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

// ── Field label + wrapper ──────────────────────────────────────────────
function Field({ label, required, hint, children, error, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-[13.5px] font-semibold text-ink">
          {label}{required && <span className="text-primary"> *</span>}
        </label>
      )}
      {hint && <p className="text-[12.5px] text-muted leading-snug">{hint}</p>}
      {children}
      {error && <p className="text-[12px] text-rose-500">{error}</p>}
    </div>
  );
}

// ── Text input ─────────────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder, id, iconLeft, onBlur, onKeyDown, ai }) {
  return (
    <div className="relative">
      {iconLeft && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon name={iconLeft} size={16} />
        </span>
      )}
      <input id={id} value={value || ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onKeyDown={onKeyDown}
        className={`w-full h-11 rounded-xl border bg-white text-[14.5px] text-ink placeholder:text-muted/70
          ${iconLeft ? 'pl-9 pr-3' : 'px-3.5'} ${ai ? 'border-primary/60 ring-2 ring-sky-soft' : 'border-line'}
          focus:border-primary focus:ring-2 focus:ring-sky-soft outline-none transition`} />
      {ai && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10.5px] font-bold text-primary bg-sky-soft rounded-full px-2 py-0.5">
          <Icon name="sparkles" size={11} /> AI
        </span>
      )}
    </div>
  );
}

// ── Select (native, styled) ────────────────────────────────────────────
function Select({ value, onChange, placeholder, options, id, ai }) {
  return (
    <div className="relative">
      <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 rounded-xl border bg-white text-[14.5px] ${value ? 'text-ink' : 'text-muted/70'}
          px-3.5 pr-9 appearance-none outline-none transition
          ${ai ? 'border-primary/60 ring-2 ring-sky-soft' : 'border-line'} focus:border-primary focus:ring-2 focus:ring-sky-soft`}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
}

// ── Chip (toggle) — mode 'multi' (checkbox) | 'single' (radio) ──────────
function Chip({ children, active, onClick, size = 'md', mode = 'multi' }) {
  const pad = size === 'sm' ? 'h-8 px-3 text-[12.5px] whitespace-nowrap' : 'h-9 px-3.5 text-[13px] whitespace-nowrap';
  const single = mode === 'single';
  return (
    <button type="button" onClick={onClick} role={single ? 'radio' : 'checkbox'} aria-checked={!!active}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${pad}
        ${active
          ? 'border-primary bg-sky-soft text-primary-700'
          : 'border-line bg-white text-body hover:border-primary/40'}`}>
      {single
        ? <span className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${active ? 'border-primary' : 'border-muted/50'}`}>{active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}</span>
        : (active && <Icon name="check" size={13} />)}
      {children}
    </button>
  );
}

// ── Goal card (multi-select, obvious affordance) ───────────────────────
function GoalCard({ goal, active, onClick }) {
  return (
    <button type="button" onClick={onClick} role="checkbox" aria-checked={!!active} aria-label={goal.label}
      className={`group relative text-left rounded-2xl border p-3.5 transition-all
        ${active ? 'border-primary bg-sky-tint shadow-[0_0_0_1px_var(--tw-primary)]' : 'border-line bg-white hover:border-primary/40 hover:shadow-card'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
          ${active ? 'bg-primary text-white' : 'bg-sky-soft text-primary'}`}>
          <Icon name={goal.icon} size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-ink leading-snug">{goal.label}</div>
          <div className="mt-1.5 text-[11px] text-muted truncate">
            unlocks <span className="font-medium text-body">{goal.unlocks}</span>
          </div>
        </div>
        <span className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition
          ${active ? 'bg-primary border-primary text-white' : 'border-line text-transparent'}`}>
          <Icon name="check" size={13} />
        </span>
      </div>
    </button>
  );
}

// ── Stepper (numbered) ─────────────────────────────────────────────────
function Stepper({ steps, current, mobile }) {
  return (
    <div className={`flex items-center justify-center ${mobile ? 'gap-1.5' : 'gap-2'} w-full`}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`flex items-center justify-center rounded-full text-[12.5px] font-bold transition-colors
                ${mobile ? 'w-7 h-7' : 'w-8 h-8'}
                ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-sky-soft' : 'bg-white text-muted border border-line'}`}>
                {done ? <Icon name="check" size={15} /> : i + 1}
              </div>
              {!mobile && (
                <span className={`text-[11.5px] font-medium whitespace-nowrap ${active ? 'text-primary' : done ? 'text-body' : 'text-muted'}`}>{s}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] rounded ${mobile ? 'w-6' : 'w-16'} ${i < current ? 'bg-primary' : 'bg-line'} -mt-0 ${mobile ? '' : 'mb-5'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── "Saved" pill (trust reassurance) ───────────────────────────────────
function SavedPill() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Saved
    </span>
  );
}

// ── Section header inside a step ───────────────────────────────────────
function SectionLabel({ icon, children, hint, tag }) {
  const tagCls = tag === 'Required' ? 'bg-primary/10 text-primary-700' : 'bg-canvas text-muted';
  return (
    <div>
      <div className="flex items-center gap-2 text-ink min-w-0">
        {icon && <span className="text-primary shrink-0"><Icon name={icon} size={16} /></span>}
        <span className="text-[14px] font-semibold flex-1 min-w-0">{children}</span>
        {tag && <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tagCls}`}>{tag}</span>}
      </div>
      {hint && <p className="text-[12.5px] text-muted mt-1 leading-snug">{hint}</p>}
    </div>
  );
}

// ── ReportPreview — live "your report will include" (bar | full rail) ───
function reportSections(form) {
  const selectedGoals = GOALS.filter((g) => (form.goal_ids || []).includes(g.id));
  const tc = form.target_customers || {};
  const base = [
    { label: 'Executive summary', on: true },
    { label: 'Market landscape', on: (form.industry_sector || []).length > 0 },
    ...[...new Set(selectedGoals.map((g) => g.unlocks))].map((s) => ({ label: s, on: true })),
    { label: 'Competitor landscape', on: (form.known_competitors || []).some((c) => c.name || c.website) },
    { label: 'SWOT & risks', on: (form.challenge_tags || []).length > 0 },
    { label: 'Lead List', on: !!tc.customer_type || (tc.industries || []).length > 0 || (tc.named_companies || []).some((c) => c.name) },
    { label: '90-day action plan', on: true },
  ];
  const seen = new Set();
  return base.filter((s) => { if (seen.has(s.label)) return false; seen.add(s.label); return true; });
}

function ReportPreview({ form, mobile, variant }) {
  const sections = reportSections(form);
  const unlocked = sections.filter((s) => s.on);
  const off = sections.length - unlocked.length;

  if (variant === 'bar') {
    return (
      <div className="rounded-xl border border-primary/20 bg-sky-tint px-4 py-2.5 flex items-start gap-2.5">
        <span className="text-primary shrink-0 mt-0.5"><Icon name="sparkles" size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink">{unlocked.length} report sections ready{off > 0 && <span className="text-muted font-normal"> · {off} more to unlock</span>}</div>
          {!mobile && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {unlocked.slice(0, 7).map((s) => <span key={s.label} className="text-[11px] font-medium text-primary-700 bg-white/70 rounded-full px-2 py-0.5 whitespace-nowrap">{s.label}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-canvas p-5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-primary shrink-0"><Icon name="sparkles" size={16} /></span>
        <span className="text-[13.5px] font-bold text-ink flex-1 min-w-0">Your report will include</span>
      </div>
      <div className="mt-3 space-y-2">
        {sections.map((s) => (
          <div key={s.label} className={`flex items-center gap-2 text-[13px] ${s.on ? 'text-body' : 'text-muted/50'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.on ? 'text-emerald-500' : 'text-muted/30'}`}>
              <Icon name={s.on ? 'check' : 'plus'} size={14} />
            </span>
            {s.label}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-line text-[12px] text-muted flex items-center gap-2 whitespace-nowrap">
        <Icon name="clock" size={13} /> Generates in ~2–4 minutes
      </div>
    </div>
  );
}

// ── CompanyPicker — single autocomplete field (name → domain resolved) ─
// Value/onChange use the same [{name, website}] shape as before; the website
// is filled by selection (or left blank for the backend to resolve) — the
// user never types a URL.
function CompanyPicker({ rows, onChange, max, placeholder, mobile }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const query = q.trim();
  const lc = query.toLowerCase();
  const chosen = new Set(rows.map((r) => (r.name || '').toLowerCase()));
  const matches = lc
    ? (window.COMPANY_DIRECTORY || []).filter((c) => c.name.toLowerCase().includes(lc) && !chosen.has(c.name.toLowerCase())).slice(0, 6)
    : [];
  const exact = (window.COMPANY_DIRECTORY || []).some((c) => c.name.toLowerCase() === lc);
  const atCap = rows.length >= max;

  // Does the typed value look like a website/domain?
  const looksLikeUrl = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(query);
  const cleanDomain = (s) => s.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
  const nameFromDomain = (d) => { const base = cleanDomain(d).split('.')[0]; return base.charAt(0).toUpperCase() + base.slice(1); };

  function add(entry) {
    if (rows.length >= max) return;
    if (chosen.has((entry.name || '').toLowerCase())) return;
    onChange([...rows, entry]);
    setQ(''); setOpen(false);
  }
  const addTyped = () => {
    if (!query) return;
    if (looksLikeUrl) add({ name: nameFromDomain(query), website: cleanDomain(query) });
    else add({ name: query, website: '' });
  };

  return (
    <div className="space-y-2">
      {/* Selected as tags */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rows.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white pl-2.5 pr-1.5 py-1.5 max-w-full">
              <span className="w-6 h-6 rounded-md bg-sky-soft text-primary flex items-center justify-center text-[11px] font-bold shrink-0">{(c.name || '?').slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 max-w-[150px]">
                <span className="block text-[13px] font-semibold text-ink leading-tight truncate">{c.name}</span>
                <span className="block text-[11px] text-muted leading-tight truncate">{c.website ? c.website : "add a website ↑ for a better match"}</span>
              </span>
              <button onClick={() => onChange(rows.filter((_, idx) => idx !== i))} aria-label={`Remove ${c.name}`}
                className="w-6 h-6 rounded-md text-muted hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0">
                <Icon name="x" size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search/add field */}
      {atCap ? (
        <p className="text-[12px] text-muted flex items-center gap-1.5"><Icon name="check" size={13} /> Maximum of {max} added — remove one to change.</p>
      ) : (
        <div className="relative">
          <TextInput iconLeft="search" placeholder={placeholder} value={q}
            onChange={(v) => { setQ(v); setOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) add(matches[0]); else addTyped(); } }} />
          {open && query && (
            <div className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl border border-line bg-white shadow-pop overflow-hidden">
              {matches.map((c) => (
                <button key={c.name} onClick={() => add(c)}
                  className="w-full text-left px-3 h-12 hover:bg-sky-tint flex items-center gap-2.5 border-b border-line/60 last:border-0">
                  <span className="w-7 h-7 rounded-md bg-sky-soft text-primary flex items-center justify-center text-[12px] font-bold shrink-0">{c.name.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-ink truncate">{c.name}</span>
                    <span className="block text-[11.5px] text-muted truncate">{c.website}</span>
                  </span>
                  <Icon name="plus" size={15} className="text-primary shrink-0" />
                </button>
              ))}
              {!exact && (
                <button onClick={addTyped}
                  className="w-full text-left px-3 h-11 hover:bg-sky-tint flex items-center gap-2.5 text-primary-700 font-medium">
                  <span className="w-7 h-7 rounded-md bg-sky-soft flex items-center justify-center shrink-0"><Icon name={looksLikeUrl ? 'link' : 'plus'} size={15} /></span>
                  <span className="min-w-0 truncate text-[13.5px]">{looksLikeUrl ? <>Add website <span className="font-semibold">{cleanDomain(query)}</span></> : <>Add “{query}” — add its website for a better match</>}</span>
                </button>
              )}
              {!matches.length && exact && (
                <div className="px-3 h-11 text-[13px] text-muted flex items-center">Already added above.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  Icon, IconBadge, PrimaryButton, GhostButton, Field, TextInput, Select,
  Chip, GoalCard, Stepper, SavedPill, SectionLabel, ReportPreview, CompanyPicker,
});
