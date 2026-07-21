import { useEffect, useState } from "react";

interface NavItem {
  el: HTMLElement;
  num: number;
  label: string;
}

/**
 * Web-only scroll-spy rail for the report_v2 surface. DOM-driven so it stays in
 * lockstep with the CSS-counter numbering (DECISIONS #9): it reads the
 * numbered section cards actually rendered — a suppressed section never leaves a
 * gap — and takes each label from the card's own `.report-section-label`, so it
 * needs no second source of truth. Collapsed to a tick strip in the gutter;
 * hover reveals labels. `print:hidden` — the printed report keeps its own
 * numbered headings.
 */
const ReportNav = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = document.querySelector("[data-report-v2]");
    if (!root) return;

    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-report-v2-section][data-numbered]")
    );
    const model: NavItem[] = els.map((el, i) => ({
      el,
      num: i + 1,
      label: el.querySelector(".report-section-label")?.textContent?.trim() || `Section ${i + 1}`,
    }));
    setItems(model);
    if (model.length < 2) return;

    // Highlight the section whose top has crossed into the upper band of the
    // viewport; the asymmetric rootMargin makes the active row switch as a
    // section header nears the top rather than when it is centred.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!hit) return;
        const idx = els.indexOf(hit.target as HTMLElement);
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Report sections"
      className="group fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 pl-2 print:hidden lg:block"
    >
      <ul className="flex flex-col gap-0.5 rounded-r-xl border border-l-0 border-transparent bg-transparent py-2 pl-1 pr-2 transition-colors group-hover:border-report-border group-hover:bg-white/95 group-hover:shadow-lg group-hover:backdrop-blur-sm">
        {items.map((it, i) => {
          const on = active === i;
          return (
            <li key={it.num}>
              <button
                type="button"
                onClick={() => it.el.scrollIntoView({ behavior: "smooth", block: "start" })}
                aria-current={on ? "true" : undefined}
                className="flex w-full items-center gap-2.5 rounded-md py-1 pl-1 pr-2 text-left transition-colors hover:bg-report-tint"
              >
                <span
                  aria-hidden
                  className={`h-[2px] shrink-0 rounded-full transition-all ${
                    on ? "w-6 bg-report-sky" : "w-3.5 bg-report-dash group-hover:w-4"
                  }`}
                />
                <span
                  className={`max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] opacity-0 transition-all duration-200 group-hover:max-w-[340px] group-hover:opacity-100 ${
                    on ? "text-report-action" : "text-report-muted"
                  }`}
                >
                  {String(it.num).padStart(2, "0")} · {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ReportNav;
