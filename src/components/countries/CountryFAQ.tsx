import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CountryFaq } from "@/lib/countryPageContent";

interface CountryFAQProps {
  countryName: string;
  countrySlug: string;
  faqs: CountryFaq[];
}

export const CountryFAQ = ({ countryName, countrySlug, faqs }: CountryFAQProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return faqs;
    const q = query.toLowerCase();
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  if (!faqs?.length) return null;

  return (
    <section id="faqs" className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark mb-3">
            09 / FAQs
          </div>
          <h2 className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold text-mes-ink">
            The questions {countryName} founders actually ask
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <aside className="hidden md:block md:col-span-4">
            <div className="md:sticky md:top-32 space-y-4">
              <div className="bg-mes-ink text-white rounded-xl p-6">
                <div className="text-[11px] uppercase tracking-wider text-white/60 mb-2">
                  Ask a question
                </div>
                <h3 className="text-[20px] font-semibold leading-tight">
                  Not seeing yours? We will answer it.
                </h3>
                <Button asChild className="mt-5 bg-mes-teal hover:bg-mes-teal-dark text-white">
                  <a href={`/contact?topic=${countrySlug}-question`}>Submit a question</a>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mes-ink-muted" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search FAQs"
                  className="pl-9 bg-mes-bg border-mes-border text-mes-ink placeholder:text-mes-ink-muted"
                />
              </div>
            </div>
          </aside>

          <div className="col-span-12 md:col-span-8">
            <Accordion type="multiple" className="space-y-2">
              {filtered.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="bg-mes-bg border border-mes-border rounded-xl px-5"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-left text-[15.5px] font-semibold text-mes-ink">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[14.5px] leading-relaxed text-mes-ink-soft">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
