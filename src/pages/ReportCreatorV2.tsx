import { Helmet } from 'react-helmet-async';
import { Compass } from 'lucide-react';

/**
 * Report Creator v2 — Phase 0 stub.
 *
 * Toggled on via `?v2=1` (sticky in localStorage via src/lib/featureFlags.ts).
 * Subsequent phases will replace this with the persona pick + 4-step wizard
 * per docs/redesign/handoff/README.md.
 */
const ReportCreatorV2 = () => (
  <>
    <Helmet>
      <title>AI Market Entry Report (v2 preview) | Market Entry Secrets</title>
      <meta name="description" content="Redesigned market-entry intake (v2 preview)." />
    </Helmet>

    <main className="font-rc min-h-screen bg-rc-canvas px-4 pt-24 pb-16">
      <div className="mx-auto max-w-[760px] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rc-sky-soft text-rc-primary-700 shadow-rc-card">
          <Compass className="h-7 w-7" aria-hidden />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-rc-primary-700">
          Choose your journey
        </p>
        <h1 className="mt-2 text-[30px] font-bold tracking-tight text-rc-ink sm:text-[34px]">
          Report Creator v2 — Phase 0 scaffold
        </h1>
        <p className="mx-auto mt-3 max-w-[560px] text-[14.5px] leading-relaxed text-rc-body">
          The v2 flag is on. Design tokens, Plus Jakarta Sans, the button gradient and
          card / pop shadows are wired up. The persona pick and 4-step wizard land in
          Phase 2.
        </p>

        <div className="mt-8 rounded-2xl border border-rc-line bg-white p-6 text-left shadow-rc-card">
          <p className="text-[13.5px] font-semibold text-rc-ink">Token resolution check</p>
          <p className="mt-1 text-[12.5px] text-rc-muted">
            If these swatches render with their colour names visible on the right hue,
            the Tailwind theme + CSS variables resolved correctly.
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { name: 'primary',     cls: 'bg-rc-primary',     fg: 'text-white' },
              { name: 'primary-700', cls: 'bg-rc-primary-700', fg: 'text-white' },
              { name: 'ink',         cls: 'bg-rc-ink',         fg: 'text-white' },
              { name: 'body',        cls: 'bg-rc-body',        fg: 'text-white' },
              { name: 'muted',       cls: 'bg-rc-muted',       fg: 'text-white' },
              { name: 'line',        cls: 'bg-rc-line',        fg: 'text-rc-ink' },
              { name: 'canvas',      cls: 'bg-rc-canvas',      fg: 'text-rc-ink' },
              { name: 'sky-soft',    cls: 'bg-rc-sky-soft',    fg: 'text-rc-ink' },
              { name: 'sky-tint',    cls: 'bg-rc-sky-tint',    fg: 'text-rc-ink' },
              { name: 'success',     cls: 'bg-rc-success',     fg: 'text-white' },
            ].map((t) => (
              <li
                key={t.name}
                className={`flex h-9 items-center justify-center rounded-xl border border-rc-line text-[11.5px] font-medium ${t.cls} ${t.fg}`}
              >
                {t.name}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="bg-rc-btn-gradient inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold text-white shadow-rc-card transition-shadow hover:shadow-rc-pop"
            >
              Gradient button (48px)
            </button>
            <span className="inline-flex h-8 items-center rounded-full bg-rc-sky-soft px-3 text-[12px] font-semibold text-rc-primary-700">
              Active chip
            </span>
            <span className="inline-flex h-8 items-center rounded-full border border-rc-line px-3 text-[12px] font-medium text-rc-body">
              Resting chip
            </span>
          </div>
        </div>

        <p className="mt-6 text-[12.5px] text-rc-muted">
          Disable with <code className="font-mono">?v2=0</code> to return to the live flow.
        </p>
      </div>
    </main>
  </>
);

export default ReportCreatorV2;
