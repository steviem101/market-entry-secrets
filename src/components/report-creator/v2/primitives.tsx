/**
 * Shared primitives for the v2 intake wizard, styled with the --rc-* design
 * tokens (README §Design tokens). Recreated from the prototype's bespoke
 * controls; icons come from lucide-react via RcIcon.
 *
 * Accessibility (handoff guardrails / P2.3):
 *  - single-select chip groups: role="radiogroup", children role="radio",
 *    roving tabindex + arrow-key navigation, Space/Enter select.
 *  - multi-select chip groups: role="group", children role="checkbox",
 *    Space/Enter toggle (native button).
 *  - goal cards: role="checkbox" aria-checked.
 *  - visible focus rings; ≥44px hit targets on mobile.
 */
import { useId, useRef, type ReactNode, type KeyboardEvent } from 'react';
import { RcIcon } from './icons';

// ── Buttons ────────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: string | null;
  iconLeft?: string | null;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function RcPrimaryButton({
  children, onClick, className = '', icon = 'arrowRight', iconLeft, disabled, type = 'button',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-rc-btn-gradient inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-[15px] font-semibold text-white shadow-rc-card transition-shadow hover:shadow-rc-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {iconLeft && <RcIcon name={iconLeft} size={18} />}
      {children}
      {icon && !iconLeft && <RcIcon name={icon} size={18} />}
    </button>
  );
}

export function RcGhostButton({
  children, onClick, className = '', icon = 'arrowLeft',
}: { children: ReactNode; onClick?: () => void; className?: string; icon?: string | null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-rc-line bg-white px-5 text-[15px] font-semibold text-rc-body transition-colors hover:bg-rc-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary focus-visible:ring-offset-2 ${className}`}
    >
      {icon && <RcIcon name={icon} size={18} />}
      {children}
    </button>
  );
}

// ── Icon badge ──────────────────────────────────────────────────────────────
export function RcIconBadge({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const ico = size === 'lg' ? 26 : size === 'sm' ? 18 : 22;
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-rc-sky-soft text-rc-primary`}>
      <RcIcon name={name} size={ico} />
    </div>
  );
}

// ── Field wrapper ───────────────────────────────────────────────────────────
export function RcField({
  label, required, hint, children, error, htmlFor,
}: {
  label?: string; required?: boolean; hint?: string; children: ReactNode; error?: string; htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-[13.5px] font-semibold text-rc-ink">
          {label}{required && <span className="text-rc-primary"> *</span>}
        </label>
      )}
      {hint && <p className="text-[12.5px] leading-snug text-rc-muted">{hint}</p>}
      {children}
      {error && <p className="text-[12px] text-rose-500">{error}</p>}
    </div>
  );
}

// ── Text input ──────────────────────────────────────────────────────────────
export function RcTextInput({
  value, onChange, placeholder, id, iconLeft, onBlur, onKeyDown, ai, maxLength, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; id?: string;
  iconLeft?: string; onBlur?: () => void; onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  ai?: boolean; maxLength?: number; ariaLabel?: string;
}) {
  return (
    <div className="relative">
      {iconLeft && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rc-muted">
          <RcIcon name={iconLeft} size={16} />
        </span>
      )}
      <input
        id={id}
        value={value || ''}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`h-11 w-full rounded-xl border bg-white text-[14.5px] text-rc-ink placeholder:text-rc-muted/70 ${
          iconLeft ? 'pl-9 pr-3' : 'px-3.5'
        } ${ai ? 'border-rc-primary/60 ring-2 ring-rc-sky-soft' : 'border-rc-line'} outline-none transition focus:border-rc-primary focus:ring-2 focus:ring-rc-sky-soft`}
      />
      {ai && (
        <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-rc-sky-soft px-2 py-0.5 text-[10.5px] font-bold text-rc-primary">
          <RcIcon name="sparkles" size={11} /> AI
        </span>
      )}
    </div>
  );
}

// ── Select (native, styled) ─────────────────────────────────────────────────
export function RcSelect({
  value, onChange, placeholder, options, id, ai, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: readonly string[]; id?: string; ai?: boolean; ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value || ''}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-9 text-[14.5px] ${
          value ? 'text-rc-ink' : 'text-rc-muted/70'
        } outline-none transition ${
          ai ? 'border-rc-primary/60 ring-2 ring-rc-sky-soft' : 'border-rc-line'
        } focus:border-rc-primary focus:ring-2 focus:ring-rc-sky-soft`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rc-muted">
        <RcIcon name="chevronDown" size={16} />
      </span>
    </div>
  );
}

// ── Chip (single button) ────────────────────────────────────────────────────
// `mode` only affects the visual marker + role. Keyboard activation is native
// (button → Space/Enter). Radio arrow-key nav is handled by RcRadioChipGroup.
interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  mode?: 'multi' | 'single';
  tabIndex?: number;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  refEl?: (el: HTMLButtonElement | null) => void;
}

export function RcChip({
  children, active, onClick, size = 'md', mode = 'multi', tabIndex, onKeyDown, refEl,
}: ChipProps) {
  // ≥44px hit target on mobile; the prototype's 32–36px visual on desktop.
  const pad = size === 'sm'
    ? 'min-h-[44px] sm:min-h-0 sm:h-8 px-3 text-[12.5px]'
    : 'min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 text-[13px]';
  const single = mode === 'single';
  return (
    <button
      type="button"
      ref={refEl}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={single ? 'radio' : 'checkbox'}
      aria-checked={!!active}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary focus-visible:ring-offset-1 ${pad} ${
        active
          ? 'border-rc-primary bg-rc-sky-soft text-rc-primary-700'
          : 'border-rc-line bg-white text-rc-body hover:border-rc-primary/40'
      }`}
    >
      {single ? (
        <span className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-[1.5px] ${active ? 'border-rc-primary' : 'border-rc-muted/50'}`}>
          {active && <span className="h-1.5 w-1.5 rounded-full bg-rc-primary" />}
        </span>
      ) : (
        active && <RcIcon name="check" size={13} />
      )}
      {children}
    </button>
  );
}

// ── Single-select chip group (radiogroup, arrow-key roving) ─────────────────
export function RcRadioChipGroup({
  label, options, value, onChange, allowDeselect = true, size = 'sm',
}: {
  label: string; options: readonly string[]; value: string;
  onChange: (v: string) => void; allowDeselect?: boolean; size?: 'sm' | 'md';
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusIndex(i: number) {
    const n = options.length;
    const idx = ((i % n) + n) % n;
    refs.current[idx]?.focus();
    onChange(options[idx]); // arrow moves selection with focus (radio semantics)
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); focusIndex(i + 1); break;
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); focusIndex(i - 1); break;
      case 'Home': e.preventDefault(); focusIndex(0); break;
      case 'End': e.preventDefault(); focusIndex(options.length - 1); break;
      default: break;
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o, i) => {
        const isActive = value === o;
        // Roving tabindex: only the active (or first) chip is in the tab order.
        const tab = isActive || (value === '' && i === 0) ? 0 : -1;
        return (
          <RcChip
            key={o}
            size={size}
            mode="single"
            active={isActive}
            tabIndex={tab}
            refEl={(el) => { refs.current[i] = el; }}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(allowDeselect && isActive ? '' : o)}
          >
            {o}
          </RcChip>
        );
      })}
    </div>
  );
}

// ── Goal card (multi-select) ────────────────────────────────────────────────
export interface GoalCardData { id: string; label: string; icon: string; unlocks: string }

export function RcGoalCard({
  goal, active, onClick,
}: { goal: GoalCardData; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="checkbox"
      aria-checked={!!active}
      aria-label={`${goal.label} — unlocks ${goal.unlocks}`}
      className={`group relative rounded-2xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary focus-visible:ring-offset-2 ${
        active
          ? 'border-rc-primary bg-rc-sky-tint shadow-[0_0_0_1px_hsl(var(--rc-primary))]'
          : 'border-rc-line bg-white hover:border-rc-primary/40 hover:shadow-rc-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? 'bg-rc-primary text-white' : 'bg-rc-sky-soft text-rc-primary'}`}>
          <RcIcon name={goal.icon} size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold leading-snug text-rc-ink">{goal.label}</div>
          <div className="mt-1.5 truncate text-[11px] text-rc-muted">
            unlocks <span className="font-medium text-rc-body">{goal.unlocks}</span>
          </div>
        </div>
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${active ? 'border-rc-primary bg-rc-primary text-white' : 'border-rc-line text-transparent'}`}>
          <RcIcon name="check" size={13} />
        </span>
      </div>
    </button>
  );
}

// ── Numbered stepper ────────────────────────────────────────────────────────
export function RcStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center justify-center gap-1.5 sm:gap-2" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                aria-current={active ? 'step' : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12.5px] font-bold transition-colors sm:h-8 sm:w-8 ${
                  done ? 'bg-rc-primary text-white'
                    : active ? 'bg-rc-primary text-white ring-4 ring-rc-sky-soft'
                    : 'border border-rc-line bg-white text-rc-muted'
                }`}
              >
                {done ? <RcIcon name="check" size={15} /> : i + 1}
              </div>
              <span className={`hidden whitespace-nowrap text-[11.5px] font-medium sm:block ${active ? 'text-rc-primary' : done ? 'text-rc-body' : 'text-rc-muted'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] w-6 rounded sm:mb-5 sm:w-16 ${i < current ? 'bg-rc-primary' : 'bg-rc-line'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── "Saved" pill ────────────────────────────────────────────────────────────
export function RcSavedPill() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
    </span>
  );
}

// ── Section header inside a step ────────────────────────────────────────────
export function RcSectionLabel({
  icon, children, hint, tag,
}: { icon?: string; children: ReactNode; hint?: string; tag?: 'Required' | 'Recommended' | 'Optional' }) {
  const tagCls = tag === 'Required' ? 'bg-rc-primary/10 text-rc-primary-700' : 'bg-rc-canvas text-rc-muted';
  return (
    <div>
      <div className="flex min-w-0 items-center gap-2 text-rc-ink">
        {icon && <span className="shrink-0 text-rc-primary"><RcIcon name={icon} size={16} /></span>}
        <span className="min-w-0 flex-1 text-[14px] font-semibold">{children}</span>
        {tag && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tagCls}`}>{tag}</span>}
      </div>
      {hint && <p className="mt-1 text-[12.5px] leading-snug text-rc-muted">{hint}</p>}
    </div>
  );
}

/** A stable id helper for label/field association. */
export function useFieldId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}
