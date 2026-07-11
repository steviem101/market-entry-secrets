import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { CountryPlaybookStage } from "@/lib/countryPageContent";

interface CountryPlaybookProps {
  countryName: string;
  countrySlug: string;
  stages: CountryPlaybookStage[];
}

export const CountryPlaybook = ({ countryName, countrySlug, stages }: CountryPlaybookProps) => {
  const initial = stages[0] ? `stage-${stages[0].stage_number}` : undefined;
  const [active, setActive] = useState<string | undefined>(initial);

  if (!stages?.length) return null;

  return (
    <section id="playbook" className="border-b border-mes-border bg-mes-bg">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <SectionHeading
          className="mb-10"
          kicker="05 / The playbook"
          title="Six stages from validation to scale"
          subhead={`The sequence ${countryName} founders run from first AU buyer call to APAC hub.`}
        />

        <div className="grid grid-cols-12 gap-8">
          <aside className="hidden md:block md:col-span-3">
            <ol className="md:sticky md:top-32 space-y-2">
              {stages.map((s) => {
                const value = `stage-${s.stage_number}`;
                const isActive = active === value;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActive(value)}
                      className={`w-full text-left rounded-lg border px-3 py-3 flex items-center gap-3 transition-colors ${
                        isActive
                          ? "bg-mes-ink-surface text-white border-mes-ink-surface"
                          : "bg-mes-card border-mes-border text-mes-ink-soft hover:border-mes-ink"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] tabular-nums ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-mes-bg text-mes-ink-soft"
                        }`}
                      >
                        {String(s.stage_number).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold">{s.title}</span>
                        <span
                          className={`block text-[11.5px] ${isActive ? "text-white/70" : "text-mes-ink-muted"}`}
                        >
                          {s.time_range}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <div className="col-span-12 md:col-span-9">
            <Accordion
              type="single"
              collapsible
              value={active}
              onValueChange={(v) => setActive(v || undefined)}
              className="space-y-3"
            >
              {stages.map((s) => {
                const value = `stage-${s.stage_number}`;
                return (
                  <AccordionItem
                    key={s.id}
                    value={value}
                    className="bg-mes-card border border-mes-border rounded-xl px-5 data-[state=open]:border-mes-ink"
                  >
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4 text-left">
                        <span className="w-9 h-9 rounded-full bg-mes-bg border border-mes-border flex items-center justify-center text-[12.5px] tabular-nums text-mes-ink-soft">
                          {String(s.stage_number).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="text-[12px] uppercase tracking-wider text-mes-ink-muted">
                            {s.time_range}
                          </div>
                          <div className="text-[18px] font-semibold text-mes-ink">{s.title}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-0">
                      <p className="text-[15px] leading-relaxed text-mes-ink-soft mb-5">{s.summary}</p>
                      <ol className="relative border-l border-dashed border-mes-border pl-6 space-y-4">
                        {s.sub_steps.map((step, i) => (
                          <li key={i} className="relative">
                            <span className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-mes-card border border-mes-border flex items-center justify-center text-[10.5px] tabular-nums text-mes-ink-soft">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <p className="text-[14.5px] leading-relaxed text-mes-ink-soft">{step}</p>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Button asChild className="bg-mes-ink-surface hover:bg-black text-white">
                          <a href={`/report-creator?source=country-${countrySlug}&focus=${value}`}>
                            Open the {s.title.toLowerCase()} checklist
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <a
                          href="#ecosystem"
                          className="text-[13.5px] font-medium text-mes-teal-dark hover:text-mes-ink"
                        >
                          See partners for this stage
                        </a>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
