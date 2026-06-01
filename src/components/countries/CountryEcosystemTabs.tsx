import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgencyCard } from "./parts/AgencyCard";
import { MentorCard } from "./parts/MentorCard";
import { ServiceCard } from "./parts/ServiceCard";
import { InvestorCard } from "./parts/InvestorCard";

interface CountryEcosystemTabsProps {
  countryName: string;
  agencies: any[];
  mentors: any[];
  services: any[];
  investors: any[];
}

const EMPTY_HINT = "No matches yet. Try generating a report for personalised recommendations.";

export const CountryEcosystemTabs = ({
  countryName,
  agencies,
  mentors,
  services,
  investors,
}: CountryEcosystemTabsProps) => {
  const panels = [
    { value: "agencies", label: "Agencies", count: agencies.length, items: agencies },
    { value: "mentors", label: "Mentors", count: mentors.length, items: mentors },
    { value: "services", label: "Services", count: services.length, items: services },
    { value: "investors", label: "Investors", count: investors.length, items: investors },
  ];

  return (
    <section id="ecosystem" className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
            04 / Ecosystem
          </div>
          <h2 className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold text-mes-ink">
            The {countryName} to Australia network
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-mes-ink-soft">
            Vetted agencies, mentors, services, and investors who already work the corridor.
          </p>
        </div>

        <Tabs defaultValue="agencies" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 border-b border-mes-border w-full justify-start gap-6 rounded-none">
            {panels.map((p, i) => (
              <TabsTrigger
                key={p.value}
                value={p.value}
                className="group relative bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 rounded-none flex items-center gap-2 text-mes-ink-soft data-[state=active]:text-mes-ink"
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-mes-ink-muted group-data-[state=active]:text-mes-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] font-medium">{p.label}</span>
                <span className="text-[11px] text-mes-ink-muted tabular-nums">({p.count})</span>
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-mes-ink opacity-0 group-data-[state=active]:opacity-100" />
              </TabsTrigger>
            ))}
          </TabsList>

          {panels.map((p) => (
            <TabsContent key={p.value} value={p.value} className="mt-8">
              {p.value === "mentors" && p.items.length === 0 && (
                <div className="mb-6 border border-mes-warning/40 bg-mes-warning/10 rounded-lg p-4 text-[13.5px] text-mes-ink-soft">
                  <span className="font-semibold text-mes-ink">Coming soon.</span> The {countryName} mentor
                  network goes live in Q3 2026. Request an intro and we will route you to the closest fit today.
                </div>
              )}
              {p.items.length === 0 ? (
                <p className="text-[14px] text-mes-ink-muted">{EMPTY_HINT}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {p.value === "agencies" && p.items.map((a) => <AgencyCard key={a.id} agency={a} />)}
                  {p.value === "mentors" && p.items.map((m) => <MentorCard key={m.id} mentor={m} />)}
                  {p.value === "services" && p.items.map((s) => <ServiceCard key={s.id} provider={s} />)}
                  {p.value === "investors" && p.items.map((i) => <InvestorCard key={i.id} investor={i} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
