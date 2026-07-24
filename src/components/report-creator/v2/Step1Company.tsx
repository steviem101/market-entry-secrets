/**
 * Step 1 — Company (website-first). Mirrors reference_src/rc-step1.jsx.
 * scrapeState: idle | loading | detected | error. The scrape is non-blocking
 * (never gates Next) and fails soft. The real prefill endpoint lands in Phase 4
 * (prefillFromWebsite currently resolves null → the "couldn't auto-read" path).
 */
import { useEffect, useState } from 'react';
import {
  COUNTRY_OPTIONS, STAGE_OPTIONS, EMPLOYEE_OPTIONS, REVENUE_STAGE_OPTIONS, REGION_OPTIONS,
} from '../intakeSchema.v2';
import { INDUSTRY_GROUP_OPTIONS } from '@/constants/linkedinTaxonomy';
import {
  SCRAPE_META_KEY, clearScrapedFields, extractDomain, mergeProvenanceForDomain, mergeScrapeResult, parseScrapeMeta,
  type ScrapeFormSlice, type ScrapeMeta,
} from '@/lib/intakeScrapeMerge';
import { defaultTargetRegions, isSuggestedRegionDefault } from '@/lib/intakeRegionDefaults';
import { isFeatureEnabled } from '@/lib/featureFlags';
import type { IntakeValues, StepProps } from './types';
import { PERSONA_COPY, TOP_INDUSTRIES, MORE_INDUSTRIES } from './rcData';
import { RcIcon } from './icons';
import {
  RcField, RcTextInput, RcSelect, RcChip, RcPrimaryButton,
} from './primitives';
import { prefillFromWebsite } from './prefillWebsite';
import { trackIntakeEvent } from '@/lib/analytics/intakeFunnel';

type ScrapeState = 'idle' | 'loading' | 'detected' | 'error';
type AiField = 'company_name' | 'country_of_origin' | 'industry_sector' | 'company_stage' | 'employee_count';
type AiFields = Partial<Record<AiField, boolean>>;

export function Step1Company({ persona, form, set, errors, onNext }: StepProps) {
  const copy = PERSONA_COPY[persona];
  const [scrape, setScrape] = useState<ScrapeState>('idle');
  const [expanded, setExpanded] = useState(false);
  const [showMoreInd, setShowMoreInd] = useState(false);
  const [indQuery, setIndQuery] = useState('');
  const [aiFields, setAiFields] = useState<AiFields>({});
  // Which fields the last scrape populated (and with what), persisted so a
  // company switch after leave-and-return still clears scrape-owned values.
  const [scrapeMeta, setScrapeMeta] = useState<ScrapeMeta | null>(() => {
    try { return parseScrapeMeta(localStorage.getItem(SCRAPE_META_KEY)); } catch { return null; }
  });
  useEffect(() => {
    try {
      if (scrapeMeta) localStorage.setItem(SCRAPE_META_KEY, JSON.stringify(scrapeMeta));
      else localStorage.removeItem(SCRAPE_META_KEY);
    } catch { /* ignore */ }
  }, [scrapeMeta]);
  // The persona default (Sydney historically; National for international with
  // the MES-227 flag on) is a suggestion until the user edits regions.
  const nationalPrefill = isFeatureEnabled('intake_prefill_v3');
  const [regionSuggested, setRegionSuggested] = useState(
    () => isSuggestedRegionDefault(form.target_regions, persona, nationalPrefill),
  );

  const selected = form.industry_sector ?? [];
  const regions = form.target_regions ?? [];
  // Guard the hint against persona switches: only show "suggestion" copy while
  // the value still IS this persona's untouched default.
  const showSuggestionHint = regionSuggested && isSuggestedRegionDefault(regions, persona, nationalPrefill);

  async function runScrape() {
    const url = (form.website_url || '').trim();
    if (!url || scrape === 'loading') return;

    // Company switch: when the URL's domain differs from the one a previous
    // scrape populated, reset exactly the fields that scrape owns (values the
    // user has edited since are kept). This runs BEFORE the fetch so Company A
    // can't survive under Company B's URL even when the new scrape fails.
    let base: ScrapeFormSlice = {
      company_name: form.company_name,
      country_of_origin: form.country_of_origin,
      industry_sector: form.industry_sector,
      company_stage: form.company_stage,
      employee_count: form.employee_count,
    };
    const nextDomain = extractDomain(url);
    if (scrapeMeta && nextDomain && nextDomain !== scrapeMeta.domain) {
      const clearPatch = clearScrapedFields(base, scrapeMeta.provenance);
      base = { ...base, ...clearPatch };
      set({ ...clearPatch, website_scrape_accepted: false } as Partial<IntakeValues>);
      setAiFields({});
      setScrapeMeta(null);
    }

    setScrape('loading');
    try {
      const result = await prefillFromWebsite(url);
      if (!result) { setScrape('error'); return; }
      const hadRegion = regions.length > 0;
      const regionFallback = defaultTargetRegions(persona, nationalPrefill);
      const { patch, provenance, aiFields: nextAiFields, missingRequired } = mergeScrapeResult(base, result);
      // The merge is a suggestion only — acceptance is the user's explicit
      // "Looks right" click, not the scrape itself (analytics depend on this).
      set({
        ...patch,
        target_regions: hadRegion ? regions : regionFallback,
      } as Partial<IntakeValues>);
      setAiFields(nextAiFields);
      // Merge onto any same-domain prior provenance so a re-fetch that no longer
      // re-records a field (e.g. company_name, already filled) keeps it
      // scrape-owned (MES-226 R2). A different domain was reset to null above.
      if (nextDomain) setScrapeMeta((prev) => mergeProvenanceForDomain(prev, nextDomain, provenance));
      setRegionSuggested(!hadRegion && regionFallback.length > 0);
      // If a REQUIRED field (especially country — hard to scrape reliably) wasn't
      // captured, expand to the full fields so the user can complete it. Collapsing to
      // the "Here's what we found" card hides the empty required input, so its
      // validation fires invisibly on Next and the button looks broken (observed:
      // nory.ai detected company/industry/stage but not country -> dead Next button).
      setExpanded(missingRequired);
      setScrape('detected');
      trackIntakeEvent('website_prefill_shown', { step: 1, persona });
    } catch {
      setScrape('error');
    }
  }

  function toggleIndustry(ind: string) {
    if (selected.includes(ind)) { set({ industry_sector: selected.filter((x) => x !== ind) }); return; }
    if (selected.length >= 3) return;
    set({ industry_sector: [...selected, ind] });
  }
  function addCustomIndustry(value: string) {
    const v = value.trim();
    if (!v) return;
    if (!selected.includes(v) && selected.length < 3) {
      set({ industry_sector: [...selected, v] });
      trackIntakeEvent('field_completed', { step: 1, field_name: 'industry_sector', persona, metadata: { custom: true, value: v } });
    }
    setIndQuery('');
  }
  function toggleRegion(r: string) {
    const wasSuggested = regionSuggested;
    if (regionSuggested) setRegionSuggested(false);
    // Tapping a region while the value is still the untouched suggestion REPLACES
    // it (the hint invites "pick specific states to narrow it" — National + a city
    // is contradictory). After that first tap it's a normal multi-select (MES-227 R6).
    set({
      target_regions: regions.includes(r)
        ? regions.filter((x) => x !== r)
        : (wasSuggested ? [r] : [...regions, r]),
    });
  }

  const baseChips = showMoreInd ? [...TOP_INDUSTRIES, ...MORE_INDUSTRIES] : TOP_INDUSTRIES;
  const offList = selected.filter((s) => !baseChips.includes(s));
  const q = indQuery.trim().toLowerCase();
  const results = q
    ? INDUSTRY_GROUP_OPTIONS.filter((i) => i.toLowerCase().includes(q) && !selected.includes(i)).slice(0, 8)
    : [];
  const exactish = INDUSTRY_GROUP_OPTIONS.some((i) => i.toLowerCase() === q);
  const indAtCap = selected.length >= 3;
  const showFields = scrape !== 'detected' || expanded;

  return (
    <div className="space-y-6">
      {/* Website-first block */}
      <div className="rounded-2xl border border-rc-primary/15 bg-rc-sky-tint p-4">
        <div className="mb-2.5 flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-rc-primary"><RcIcon name="sparkles" size={16} /></span>
          <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-rc-ink">Start with your website — we'll fill in the rest</span>
        </div>
        <div className="space-y-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-end sm:gap-3 sm:space-y-0">
          <RcField label="Company website" required htmlFor="rc-website" error={errors.website_url?.message}>
            <RcTextInput
              id="rc-website" iconLeft="link" placeholder="yourcompany.com"
              value={form.website_url || ''}
              onChange={(v) => {
                set({ website_url: v });
                // If the URL changed after we already scraped, drop the stale
                // confirm-card and let the user re-scrape (Fetch / blur).
                if (scrape !== 'idle' && v !== (form.website_url || '')) {
                  setScrape('idle');
                  setExpanded(false);
                  setAiFields({});
                }
              }}
              onBlur={() => { if (form.website_url && scrape === 'idle') runScrape(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runScrape(); } }}
            />
          </RcField>
          <RcPrimaryButton
            icon={null} iconLeft={scrape === 'loading' ? null : 'search'}
            onClick={runScrape} disabled={scrape === 'loading'}
            className="h-11 w-full sm:w-auto"
          >
            {scrape === 'loading' ? 'Reading…' : 'Fetch details'}
          </RcPrimaryButton>
        </div>

        <div aria-live="polite">
          {scrape === 'loading' && (
            <p className="mt-2.5 flex items-center gap-2 text-[12.5px] text-rc-primary">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rc-primary/30 border-t-rc-primary" />
              Reading {form.website_url}… we only read public pages.
            </p>
          )}
          {scrape === 'detected' && (
            <p className="mt-2.5 flex items-center gap-2 text-[12.5px] text-emerald-600">
              <RcIcon name="check" size={14} /> Read {form.website_url} — review what we found below.
            </p>
          )}
          {scrape === 'error' && (
            <p className="mt-2.5 flex items-center gap-2 text-[12.5px] text-amber-600">
              <RcIcon name="lightbulb" size={14} /> Couldn't auto-read that site — just fill in the details below.
            </p>
          )}
        </div>
      </div>

      {/* Happy-path confirm card (one tap to accept the scrape) */}
      {scrape === 'detected' && !expanded && (
        <div className="rounded-2xl border border-rc-primary/25 bg-rc-sky-tint p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="shrink-0 text-rc-primary"><RcIcon name="sparkles" size={16} /></span>
            <span className="min-w-0 flex-1 text-[13.5px] font-bold text-rc-ink">Here's what we found</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-bold text-rc-primary">
              <RcIcon name="sparkles" size={11} /> AI
            </span>
          </div>
          {/* Only show rows the scrape actually populated — don't pass off pre-existing
              values as AI-detected. If nothing came back, show an honest note. */}
          {(() => {
            const rows: [string, AiField, string | undefined][] = [
              ['Company', 'company_name', form.company_name],
              ['Country', 'country_of_origin', form.country_of_origin],
              ['Industry', 'industry_sector', (form.industry_sector ?? []).join(', ')],
              ['Stage', 'company_stage', form.company_stage],
              ['Employees', 'employee_count', form.employee_count],
            ];
            const visible = rows.filter(([, field]) => aiFields[field]);
            if (visible.length === 0) {
              return (
                <p className="rounded-xl border border-rc-line bg-white px-3.5 py-2.5 text-[12.5px] text-rc-muted">
                  We read the page but couldn't reliably extract company details — please fill them in below.
                </p>
              );
            }
            return (
              <div className="divide-y divide-rc-line/70 rounded-xl border border-rc-line bg-white">
                {visible.map(([k, , v]) => (
                  <div key={k} className="flex items-center gap-3 px-3.5 py-2.5">
                    <span className="w-[78px] shrink-0 text-[12px] text-rc-muted">{k}</span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-rc-ink">{v || '—'}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          <div className="mt-3 flex items-center gap-2.5">
            <RcPrimaryButton
              icon={null} iconLeft="check"
              onClick={() => {
                set({ website_scrape_accepted: true });
                trackIntakeEvent('website_prefill_accepted', { step: 1, persona });
              }}
            >
              Looks right
            </RcPrimaryButton>
            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                set({ website_scrape_accepted: false });
                trackIntakeEvent('website_prefill_rejected', { step: 1, persona });
              }}
              className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-xl border border-rc-line bg-white px-4 text-[14px] font-semibold text-rc-body hover:bg-rc-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
            >
              <RcIcon name="pencil" size={15} /> Edit details
            </button>
          </div>
        </div>
      )}

      {/* Company fields */}
      {showFields && (
        <>
          <div className="space-y-5 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-5 sm:space-y-0">
            <RcField label="Company name" required htmlFor="rc-company" error={errors.company_name?.message}>
              <RcTextInput id="rc-company" placeholder="e.g. Acme Robotics" value={form.company_name || ''}
                onChange={(v) => set({ company_name: v })} ai={aiFields.company_name} />
            </RcField>
            <RcField label="Country of origin" required error={errors.country_of_origin?.message}>
              <RcSelect placeholder="Select country" options={COUNTRY_OPTIONS} value={form.country_of_origin || ''}
                onChange={(v) => set({ country_of_origin: v })} ai={aiFields.country_of_origin} ariaLabel="Country of origin" />
              {/* PD-7: free-text country when "Other" is picked, so uncovered countries
                  produce a coherent report + corridor lookup instead of the literal "Other". */}
              {form.country_of_origin === 'Other' && (
                <div className="mt-2">
                  <RcTextInput
                    placeholder="Type your country — e.g. Brazil"
                    value={form.country_of_origin_other || ''}
                    onChange={(v) => set({ country_of_origin_other: v })}
                    ariaLabel="Enter your country of origin"
                  />
                </div>
              )}
            </RcField>
            <RcField label="Company stage" required error={errors.company_stage?.message}>
              <RcSelect placeholder="Select stage" options={STAGE_OPTIONS} value={form.company_stage || ''}
                onChange={(v) => set({ company_stage: v as typeof form.company_stage })} ai={aiFields.company_stage} ariaLabel="Company stage" />
            </RcField>
            <RcField label="Number of employees" error={errors.employee_count?.message}>
              <RcSelect placeholder="Select range" options={EMPLOYEE_OPTIONS} value={form.employee_count || ''}
                onChange={(v) => set({ employee_count: v as typeof form.employee_count })} ai={aiFields.employee_count} ariaLabel="Number of employees" />
            </RcField>
            {persona === 'startup' && (
              <RcField label="Current ARR / revenue stage" error={errors.revenue_stage?.message}>
                <RcSelect placeholder="Select revenue stage" options={REVENUE_STAGE_OPTIONS} value={form.revenue_stage || ''}
                  onChange={(v) => set({ revenue_stage: v as typeof form.revenue_stage })} ariaLabel="Revenue stage" />
              </RcField>
            )}
          </div>

          {/* Industry — quick-picks + full-taxonomy search + custom */}
          <RcField
            label="Industry / sector" required
            hint="Pick up to 3. Don't see yours? Search all 152 or add your own."
            error={errors.industry_sector?.message}
          >
            <div role="group" aria-label="Industry / sector" className="flex flex-wrap gap-2">
              {offList.map((ind) => <RcChip key={ind} active onClick={() => toggleIndustry(ind)}>{ind}</RcChip>)}
              {baseChips.map((ind) => (
                <RcChip key={ind} active={selected.includes(ind)} onClick={() => toggleIndustry(ind)}>{ind}</RcChip>
              ))}
              <button
                type="button" onClick={() => setShowMoreInd(!showMoreInd)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-dashed border-rc-line px-3.5 text-[13px] text-rc-muted transition-colors hover:border-rc-primary/40 hover:text-rc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary sm:min-h-0 sm:h-9"
              >
                <RcIcon name={showMoreInd ? 'x' : 'plus'} size={13} /> {showMoreInd ? 'Show less' : `More (${MORE_INDUSTRIES.length})`}
              </button>
            </div>

            <div className="mt-2.5">
              {indAtCap ? (
                <p className="flex items-center gap-1.5 text-[12px] text-rc-muted"><RcIcon name="check" size={13} /> Maximum of 3 selected — deselect one to change.</p>
              ) : (
                <div className="relative">
                  <RcTextInput
                    iconLeft="search" placeholder="Search all industries, or type your own…"
                    value={indQuery} onChange={setIndQuery} ariaLabel="Search industries"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (results[0]) { toggleIndustry(results[0]); setIndQuery(''); }
                        else addCustomIndustry(indQuery);
                      }
                    }}
                  />
                  {q && (
                    <div className="mt-1.5 overflow-hidden rounded-xl border border-rc-line bg-white shadow-rc-card">
                      {results.map((r) => (
                        <button
                          key={r} type="button" onClick={() => { toggleIndustry(r); setIndQuery(''); }}
                          className="flex h-10 w-full items-center gap-2 border-b border-rc-line/60 px-3.5 text-left text-[13.5px] text-rc-body last:border-0 hover:bg-rc-sky-tint"
                        >
                          <RcIcon name="plus" size={13} className="text-rc-primary" /> {r}
                        </button>
                      ))}
                      {!exactish && (
                        <button
                          type="button" onClick={() => addCustomIndustry(indQuery)}
                          className="flex h-10 w-full items-center gap-2 overflow-hidden whitespace-nowrap px-3.5 text-left text-[13.5px] font-medium text-rc-primary-700 hover:bg-rc-sky-tint"
                        >
                          <RcIcon name="plus" size={13} className="shrink-0" /> <span className="truncate">Add “{indQuery.trim()}” as a custom industry</span>
                        </button>
                      )}
                      {!results.length && exactish && (
                        <div className="flex h-10 items-center px-3.5 text-[13px] text-rc-muted">Already in the list above.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </RcField>
        </>
      )}

      {/* Target regions — promoted above the fold */}
      <RcField
        label={copy.regionLabel} required
        hint={showSuggestionHint
          ? (nationalPrefill && persona === 'international'
            ? 'Pre-filled to National — pick specific states if you want to narrow it.'
            : 'Pre-filled to the most common entry point — change if needed.')
          : copy.regionHint}
        error={errors.target_regions?.message}
      >
        <div role="group" aria-label={copy.regionLabel} className="flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <RcChip key={r} active={regions.includes(r)} onClick={() => toggleRegion(r)}>{r}</RcChip>
          ))}
        </div>
      </RcField>

      <div className="flex items-center justify-end pt-2">
        <RcPrimaryButton onClick={onNext}>Next: {copy.step2Title}</RcPrimaryButton>
      </div>
    </div>
  );
}
