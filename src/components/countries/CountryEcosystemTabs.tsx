import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { trackCountryEvent } from "@/lib/analytics/countryFunnel";
import { AgencyCard } from "./parts/AgencyCard";
import { MentorCard } from "./parts/MentorCard";
import { ServiceCard } from "./parts/ServiceCard";
import { InvestorCard } from "./parts/InvestorCard";
import type {
  CountryLinkedAgency,
  CountryLinkedMentor,
  CountryLinkedProvider,
  CountryLinkedInvestor,
} from "@/hooks/useCountryPage";

interface CountryEcosystemTabsProps {
  countryName: string;
  countrySlug: string;
  agencies: CountryLinkedAgency[];
  mentors: CountryLinkedMentor[];
  services: CountryLinkedProvider[];
  investors: CountryLinkedInvestor[];
}

const EMPTY_COPY: Record<string, (country: string) => string> = {
  agencies: (c) => `We're mapping the agencies that support ${c} companies entering Australia.`,
  mentors: (c) => `We're vetting mentors who've made the ${c} to Australia move themselves.`,
  services: (c) => `We're curating service providers with real ${c} entrant experience.`,
  investors: (c) => `We're mapping investors who back ${c}-founded companies in ANZ.`,
};

export const CountryEcosystemTabs = ({
  countryName,
  countrySlug,
  agencies,
  mentors,
  services,
  investors,
}: CountryEcosystemTabsProps) => {
  const panels = [
    {
      value: "agencies",
      label: "Agencies",
      count: agencies.length,
      cards: agencies.map((a) => <AgencyCard key={a.id} agency={a} />),
    },
    {
      value: "mentors",
      label: "Mentors",
      count: mentors.length,
      cards: mentors.map((m) => <MentorCard key={m.id} mentor={m} />),
    },
    {
      value: "services",
      label: "Services",
      count: services.length,
      cards: services.map((s) => <ServiceCard key={s.id} provider={s} />),
    },
    {
      value: "investors",
      label: "Investors",
      count: investors.length,
      cards: investors.map((i) => <InvestorCard key={i.id} investor={i} />),
    },
  ];

  return (
    <section id="ecosystem" className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
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
                <span className="text-[11px] uppercase tracking-wider text-mes-ink-muted group-data-[state=active]:text-mes-ink-soft">
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
              {p.count === 0 ? (
                <div className="border border-mes-border bg-mes-bg rounded-xl p-6 max-w-2xl">
                  <p className="text-[15px] font-semibold text-mes-ink">
                    {EMPTY_COPY[p.value]?.(countryName)}
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-mes-ink-soft">
                    Request an intro and we will route you to the closest fit today.
                  </p>
                  <Button asChild variant="link" className="mt-3 p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
                    <Link
                      to={`/contact?topic=country-intro&country=${countrySlug}&section=${p.value}`}
                      onClick={() =>
                        trackCountryEvent(countrySlug, "intro_request_click", { section: p.value })
                      }
                    >
                      Request an intro
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{p.cards}</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
