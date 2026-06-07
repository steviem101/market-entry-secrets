/**
 * Step 3 — Customers & priorities. The structured replacement for the three
 * problem textareas + end-buyers. Mirrors reference_src/rc-step2.jsx
 * Step3Profile, adapted to the v2 schema (target_customers, challenges.tags,
 * report_focus). Customer type defaults to B2B; size/motion sit behind a
 * skippable expander. Selection semantics differ: single = radio, multi = check.
 */
import { useEffect, useState } from 'react';
import {
  CUSTOMER_TYPE, CUSTOMER_SIZE, BUYING_MOTION, COMMON_CHALLENGES, FOCUS_PROMPTS,
} from '../intakeSchema.v2';
import { INDUSTRY_GROUP_OPTIONS } from '@/constants/linkedinTaxonomy';
import type { StepProps } from './types';
import { PERSONA_COPY, TOP_INDUSTRIES } from './rcData';
import { RcIcon } from './icons';
import {
  RcField, RcTextInput, RcChip, RcRadioChipGroup, RcGhostButton, RcPrimaryButton, RcSectionLabel,
} from './primitives';
import { ReportPreview } from './ReportPreview';
import { CompanyPicker } from './CompanyPicker';

export function Step3Details({ persona, form, set, onNext, onBack }: StepProps) {
  const copy = PERSONA_COPY[persona];
  const challenges = COMMON_CHALLENGES[persona];
  const prompts = FOCUS_PROMPTS[persona];
  const tc = form.target_customers ?? { industries: [], named_companies: [], notes: '' };
  const comps = form.known_competitors ?? [];
  const named = tc.named_companies ?? [];
  const sellIndustries = tc.industries ?? [];
  const challengeTags = form.challenges?.tags ?? [];
  const [sellQuery, setSellQuery] = useState('');
  const [showBuyerDetail, setShowBuyerDetail] = useState(!!(tc.customer_size || tc.buying_motion));

  // Default the dominant segment so customer type is a confirm, not a cold pick.
  useEffect(() => {
    if (!tc.customer_type) setTC({ customer_type: 'B2B' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTC(patch: Partial<typeof tc>) {
    set({ target_customers: { ...tc, ...patch } });
  }
  function toggleSell(ind: string) {
    if (sellIndustries.includes(ind)) { setTC({ industries: sellIndustries.filter((x) => x !== ind) }); return; }
    if (sellIndustries.length >= 5) return;
    setTC({ industries: [...sellIndustries, ind] });
  }
  function toggleChallenge(c: string) {
    set({
      challenges: {
        ...(form.challenges ?? { tags: [], other: '' }),
        tags: challengeTags.includes(c)
          ? challengeTags.filter((x) => x !== c)
          : (challengeTags.length < 8 ? [...challengeTags, c] : challengeTags),
      },
    });
  }

  // Industries-you-sell-into search (over the full taxonomy + custom).
  const q = sellQuery.trim().toLowerCase();
  const baseSell = TOP_INDUSTRIES.slice(0, 8);
  const sellOffList = sellIndustries.filter((s) => !baseSell.includes(s));
  const sellResults = q
    ? INDUSTRY_GROUP_OPTIONS.filter((i) => i.toLowerCase().includes(q) && !sellIndustries.includes(i)).slice(0, 8)
    : [];
  const sellExact = INDUSTRY_GROUP_OPTIONS.some((i) => i.toLowerCase() === q);
  const sellAtCap = sellIndustries.length >= 5;
  const addCustomSell = () => {
    const v = sellQuery.trim();
    if (v && !sellIndustries.includes(v) && sellIndustries.length < 5) setTC({ industries: [...sellIndustries, v] });
    setSellQuery('');
  };

  return (
    <div className="space-y-6">
      <ReportPreview form={form} variant="bar" />

      {/* CUSTOMER PROFILE */}
      <div className="space-y-4">
        <RcSectionLabel icon="users" tag="Recommended" hint="Tap a few chips or describe your buyer in a sentence — either works. This powers your lead list and go-to-market plan.">
          {copy.customerLabel}
        </RcSectionLabel>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <span className="text-[12.5px] font-medium text-rc-body">Customer type <span className="font-normal text-rc-muted">· pick one</span></span>
            <RcRadioChipGroup
              label="Customer type" options={CUSTOMER_TYPE} value={tc.customer_type ?? ''}
              onChange={(v) => setTC({ customer_type: (v || undefined) as typeof tc.customer_type })}
            />
          </div>

          {showBuyerDetail ? (
            <>
              <div className="space-y-1.5">
                <span className="text-[12.5px] font-medium text-rc-body">Customer size <span className="font-normal text-rc-muted">· pick one</span></span>
                <RcRadioChipGroup
                  label="Customer size" options={CUSTOMER_SIZE} value={tc.customer_size ?? ''}
                  onChange={(v) => setTC({ customer_size: (v || undefined) as typeof tc.customer_size })}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[12.5px] font-medium text-rc-body">Buying motion <span className="font-normal text-rc-muted">· pick one</span></span>
                <RcRadioChipGroup
                  label="Buying motion" options={BUYING_MOTION} value={tc.buying_motion ?? ''}
                  onChange={(v) => setTC({ buying_motion: (v || undefined) as typeof tc.buying_motion })}
                />
              </div>
            </>
          ) : (
            <button
              type="button" onClick={() => setShowBuyerDetail(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 self-start whitespace-nowrap rounded-xl border border-dashed border-rc-line px-3.5 text-[13px] text-rc-body transition-colors hover:border-rc-primary/40 hover:text-rc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary sm:h-9 sm:min-h-0"
            >
              <RcIcon name="plus" size={14} /> Add buyer detail <span className="text-rc-muted">— size &amp; sales motion (optional)</span>
            </button>
          )}
        </div>

        <RcField label="Industries you sell into" hint="Pick any · up to 5. Search for more or add your own.">
          <div role="group" aria-label="Industries you sell into" className="flex flex-wrap gap-2">
            {sellOffList.map((ind) => <RcChip key={ind} size="sm" active onClick={() => toggleSell(ind)}>{ind}</RcChip>)}
            {baseSell.map((ind) => <RcChip key={ind} size="sm" active={sellIndustries.includes(ind)} onClick={() => toggleSell(ind)}>{ind}</RcChip>)}
          </div>
          <div className="mt-2.5">
            {sellAtCap ? (
              <p className="flex items-center gap-1.5 text-[12px] text-rc-muted"><RcIcon name="check" size={13} /> Maximum of 5 selected — deselect one to change.</p>
            ) : (
              <div className="relative">
                <RcTextInput
                  iconLeft="search" placeholder="Search all industries, or type your own…"
                  value={sellQuery} onChange={setSellQuery} ariaLabel="Search industries you sell into"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (sellResults[0]) { toggleSell(sellResults[0]); setSellQuery(''); } else addCustomSell();
                    }
                  }}
                />
                {q && (
                  <div className="mt-1.5 overflow-hidden rounded-xl border border-rc-line bg-white shadow-rc-card">
                    {sellResults.map((r) => (
                      <button
                        key={r} type="button" onClick={() => { toggleSell(r); setSellQuery(''); }}
                        className="flex h-10 w-full items-center gap-2 border-b border-rc-line/60 px-3.5 text-left text-[13.5px] text-rc-body last:border-0 hover:bg-rc-sky-tint"
                      >
                        <RcIcon name="plus" size={13} className="text-rc-primary" /> {r}
                      </button>
                    ))}
                    {!sellExact && (
                      <button
                        type="button" onClick={addCustomSell}
                        className="flex h-10 w-full items-center gap-2 overflow-hidden whitespace-nowrap px-3.5 text-left text-[13.5px] font-medium text-rc-primary-700 hover:bg-rc-sky-tint"
                      >
                        <RcIcon name="plus" size={13} className="shrink-0" /> <span className="truncate">Add “{sellQuery.trim()}” as a custom industry</span>
                      </button>
                    )}
                    {!sellResults.length && sellExact && (
                      <div className="flex h-10 items-center px-3.5 text-[13px] text-rc-muted">Already selected above.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </RcField>

        <RcField label="Specific companies you want to sell to" hint="Optional · up to 5. Search by name, or paste a website for the most accurate match.">
          <CompanyPicker
            rows={named.map((c) => ({ name: c.name ?? '', website: c.website ?? '' }))} max={5}
            placeholder="Name or website — e.g. BHP or bhp.com…"
            onChange={(next) => setTC({ named_companies: next })}
          />
        </RcField>

        <RcField label="Or, in one line: what makes a perfect customer?" hint="Optional — skip it if the chips above cover it, but a sentence is the single most useful thing you can tell us.">
          <RcTextInput
            value={tc.notes ?? ''} maxLength={300} ariaLabel="What makes a perfect customer?"
            onChange={(v) => setTC({ notes: v })}
            placeholder={persona === 'startup'
              ? 'e.g. ops leaders at mid-size logistics firms tired of manual scheduling'
              : 'e.g. procurement teams at NSW miners frustrated with slow compliance'}
          />
        </RcField>
      </div>

      <div className="h-px bg-rc-line" />

      {/* COMPETITORS */}
      <div className="space-y-2.5">
        <RcSectionLabel icon="swords" tag="Optional" hint="Search by name, or paste a website for the most accurate match. Up to 3.">
          {persona === 'startup' ? 'Key competitors' : 'Known competitors in Australia'}
        </RcSectionLabel>
        <CompanyPicker
          rows={comps.map((c) => ({ name: c.name ?? '', website: c.website ?? '' }))} max={3}
          placeholder="Name or website — e.g. CompetitorCo or competitor.com…"
          onChange={(next) => set({ known_competitors: next })}
        />
      </div>

      <div className="h-px bg-rc-line" />

      {/* CHALLENGES */}
      <div className="space-y-2">
        <RcSectionLabel icon="shield" tag="Optional" hint="Tap any that apply — sharpens your SWOT and action plan.">
          Biggest challenges right now?
        </RcSectionLabel>
        <div role="group" aria-label="Biggest challenges" className="flex flex-wrap gap-2">
          {challenges.map((c) => (
            <RcChip key={c} size="sm" active={challengeTags.includes(c)} onClick={() => toggleChallenge(c)}>{c}</RcChip>
          ))}
        </div>
      </div>

      {/* REPORT FOCUS */}
      <div className="space-y-3 rounded-2xl border border-rc-primary/15 bg-rc-sky-tint p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-rc-primary"><RcIcon name="lightbulb" size={17} /></span>
          <span className="min-w-0 flex-1 text-[14px] font-semibold text-rc-ink">What's the one thing you most want this report to answer?</span>
        </div>
        <div className="relative">
          <input
            value={form.report_focus ?? ''} maxLength={200}
            aria-label="Report focus"
            onChange={(e) => set({ report_focus: e.target.value })}
            placeholder={`e.g. “${prompts[0]}”`}
            className="h-11 w-full rounded-xl border border-rc-line bg-white pl-3.5 pr-[92px] text-[14.5px] text-rc-ink placeholder:italic placeholder:text-rc-muted/60 outline-none focus:border-rc-primary focus:ring-2 focus:ring-rc-sky-soft"
          />
          {!form.report_focus && (
            <button
              type="button" onClick={() => set({ report_focus: prompts[0] })}
              className="absolute right-2 top-1/2 inline-flex h-7 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-lg bg-rc-sky-soft px-2.5 text-[12px] font-semibold text-rc-primary-700 transition-colors hover:bg-rc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
            >
              <RcIcon name="check" size={12} /> Use this
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => {
            const on = form.report_focus === p;
            return (
              <button
                key={p} type="button" aria-pressed={on}
                onClick={() => set({ report_focus: on ? '' : p })}
                className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary sm:h-8 sm:min-h-0 ${
                  on ? 'border-rc-primary bg-rc-sky-soft text-rc-primary-700' : 'border-rc-line bg-white text-rc-body hover:border-rc-primary/50 hover:text-rc-primary'
                }`}
              >
                {on && <RcIcon name="check" size={12} />}{p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <RcGhostButton onClick={onBack}>Back</RcGhostButton>
        <RcPrimaryButton onClick={onNext}>Review</RcPrimaryButton>
      </div>
    </div>
  );
}
