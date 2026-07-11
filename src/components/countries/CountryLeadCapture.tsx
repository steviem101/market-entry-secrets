import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackCountryEvent } from "@/lib/analytics/countryFunnel";
import { SectionHeading } from "@/components/common/SectionHeading";

interface CountryLeadCaptureProps {
  countryName: string;
  countrySlug: string;
  trustCompanies?: string[];
}

export const CountryLeadCapture = ({
  countryName,
  countrySlug,
  trustCompanies = [],
}: CountryLeadCaptureProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("email_leads")
      .insert([{ email, source: `country-${countrySlug}` }]);
    setSubmitting(false);
    if (error) {
      toast.error("Could not save your email. Please try again.");
      return;
    }
    setSubmitted(true);
    trackCountryEvent(countrySlug, "lead_capture_submit", { section: "digest" });
    toast.success("You are in. Watch your inbox.");
  };

  return (
    <section className="border-b border-mes-border bg-mes-bg">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <SectionHeading
          className="mb-10"
          kicker="10 / Get started"
          title={`Three ways ${countryName} founders work with us`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-mes-card border border-mes-border rounded-xl p-6 flex flex-col">
            <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted">
              Tier 1 &middot; Free
            </div>
            <h3 className="mt-2 text-[20px] font-semibold text-mes-ink">The corridor digest</h3>
            <p className="mt-2 text-[14px] text-mes-ink-soft">
              Monthly email with new {countryName} to Australia deals, grants, and founder intros.
            </p>
            {submitted ? (
              <div className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-mes-success">
                <Check className="h-4 w-4" /> Subscribed
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border-mes-border"
                  required
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-mes-ink-surface hover:bg-black text-white"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </form>
            )}
          </article>

          <article className="bg-mes-ink-surface text-white rounded-xl p-6 flex flex-col relative">
            <span className="absolute -top-2 right-5 text-[10.5px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-mes-blue-light text-mes-teal-dark">
              Most popular
            </span>
            <div className="text-[11px] uppercase tracking-wider text-white/60">
              Tier 2 &middot; AI report
            </div>
            <h3 className="mt-2 text-[20px] font-semibold">Your AU entry plan</h3>
            <p className="mt-2 text-[14px] text-white/75">
              Generate a customised {countryName} to Australia market entry report. Matched partners, grants, ICP.
            </p>
            <Button asChild className="mt-5 bg-mes-teal hover:bg-mes-teal-dark text-white">
              <Link
                to={`/report-creator?source=country-${countrySlug}`}
                onClick={() =>
                  trackCountryEvent(countrySlug, "report_creator_click", { section: "lead_capture" })
                }
              >
                Generate my report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </article>

          <article className="bg-mes-card border border-mes-border rounded-xl p-6 flex flex-col">
            <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted">
              Tier 3 &middot; Premium
            </div>
            <h3 className="mt-2 text-[20px] font-semibold text-mes-ink">Strategy call</h3>
            <p className="mt-2 text-[14px] text-mes-ink-soft">
              90-minute working session with the MES team and a {countryName} corridor operator.
            </p>
            <Button asChild variant="outline" className="mt-5 border-mes-ink text-mes-ink hover:bg-mes-ink-surface hover:text-white">
              <Link to={`/contact?topic=${countrySlug}-call`}>
                <Phone className="mr-2 h-4 w-4" />
                Book a call
              </Link>
            </Button>
          </article>
        </div>

        {trustCompanies.length > 0 && (
          <div className="mt-12 border-t border-mes-border pt-8">
            <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted text-center">
              Trusted by {countryName} founders
            </div>
            <div className="mt-4 flex items-center justify-center flex-wrap gap-x-10 gap-y-3 text-mes-ink-soft">
              {trustCompanies.map((c) => (
                <span key={c} className="text-[14px] font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
