import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Globe,
  Handshake,
  Lock,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEcosystemStats } from "@/hooks/useEcosystemStats";
import { useFeaturedLogos } from "@/hooks/useFeaturedLogos";
import { useLeadDatabaseStats } from "@/hooks/useLeadDatabases";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { displayCount } from "@/lib/heroStatsDisplay";
import { topLeadCategories, type JourneyStepKey } from "@/lib/heroJourney";
import { mentorDisplayName, mentorInitials } from "@/lib/mentorDisplay";
import { trackFunnelEvent } from "@/lib/analytics/intakeFunnel";
import {
  SECTION_ORDER,
  SECTION_LABELS,
  SECTION_CONFIG,
  TIER_REQUIREMENTS,
  TIER_LABELS,
} from "@/components/report/reportSectionConfig";
import { REPORT_CREATOR_PATH } from "@/config/reportCta";

const JOURNEY_SOURCE = "homepage_hero";

/**
 * Mentor teaser rows for the introductions panel. Reads the PII-safe
 * community_members_public view — the same surface /mentors renders from, so
 * anonymous mentors arrive already masked server-side (alias name, masked
 * headline, NULL image) and mentorDisplayName/mentorInitials keep the
 * presentation layer consistent with the mentor cards. No new exposure.
 */
interface JourneyMentor {
  id: string | null;
  name: string | null;
  title: string | null;
  is_anonymous: boolean | null;
  avatar_url: string | null;
  image: string | null;
}

const useJourneyMentors = () =>
  useQuery({
    queryKey: ["hero-journey-mentors"],
    queryFn: async (): Promise<JourneyMentor[]> => {
      const { data, error } = await supabase
        .from("community_members_public")
        .select("id, name, title, is_anonymous, avatar_url, image")
        .eq("is_active", true)
        // Curated set only: an admin has deliberately flagged these profiles
        // for prominence, which is a stronger consent posture than surfacing
        // an arbitrary top-3 of the directory on the homepage.
        .eq("is_featured", true)
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });

const PanelShell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm min-h-[320px]">
    {children}
  </div>
);

/** Step 1 — the generated report, in its real anatomy. */
const ReportPanel = () => {
  const gatedSections = SECTION_ORDER.filter((s) => TIER_REQUIREMENTS[s]);
  const freeCount = SECTION_ORDER.length - gatedSections.length;

  return (
    <PanelShell>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Your report is generated</div>
          <div className="text-xs text-muted-foreground">
            {SECTION_ORDER.length} sections &middot; {freeCount} free
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* SWOT snippet — real quadrants from the swot_analysis section */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 text-xs font-medium text-foreground">
            {SECTION_LABELS.swot_analysis}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["Strengths", "Weaknesses", "Opportunities", "Threats"].map((q) => (
              <div key={q} className="rounded-md bg-background border border-border px-2 py-1.5">
                <div className="text-[10px] font-medium text-muted-foreground">{q}</div>
                <div className="mt-1 space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-muted" />
                  <div className="h-1.5 w-3/4 rounded-full bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section run-down — names, icons and gating from the real config */}
        <ul className="space-y-1.5" aria-label="Report sections">
          {["executive_summary", "competitor_landscape", "action_plan", ...gatedSections.slice(0, 2)].map(
            (sectionId) => {
              const config = SECTION_CONFIG[sectionId];
              const Icon = config?.icon ?? FileText;
              const requiredTier = TIER_REQUIREMENTS[sectionId];
              return (
                <li
                  key={sectionId}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded ${config?.accentBg ?? "bg-muted"}`}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="flex-1 truncate text-xs text-foreground">
                    {SECTION_LABELS[sectionId] ?? sectionId}
                  </span>
                  {requiredTier ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" />
                      {TIER_LABELS[requiredTier] ?? requiredTier}
                    </span>
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-label="Included free" />
                  )}
                </li>
              );
            },
          )}
        </ul>
      </div>
    </PanelShell>
  );
};

/** Step 2 — the matched provider / lead list the report produces. Categories,
 * counts and confirmed-featured logos only — never real lead or user records. */
const LeadsPanel = () => {
  const { stats, isReady } = useEcosystemStats();
  const { data: logos } = useFeaturedLogos();
  const { data: leadStats } = useLeadDatabaseStats();

  const categories = topLeadCategories(leadStats?.countsByType, 4);
  const logoRow = (logos ?? []).slice(0, 6);

  return (
    <PanelShell>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
          <Database className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Matched providers &amp; leads</div>
          <div className="text-xs text-muted-foreground">
            {isReady && stats
              ? `Drawn from ${displayCount(stats.serviceProviders)}+ providers and ${displayCount(stats.leadDatabases)}+ curated lead lists`
              : "Drawn from our live provider and lead directories"}
          </div>
        </div>
      </div>

      {logoRow.length > 0 && (
        <ul className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3" aria-label="Featured matched organisations">
          {logoRow.map((logo) => (
            <li key={logo.key} className="flex h-8 items-center">
              <img
                src={logo.src}
                alt={`${logo.name} logo`}
                title={logo.name}
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
                className="h-8 w-auto max-w-[110px] object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      )}

      {categories.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-foreground">Lead list categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.label}
                className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
              >
                {c.label} &middot; {c.count} {c.count === 1 ? "list" : "lists"}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recommendations trace to real directory records — categories and counts shown here, never
        individual lead or member data.
      </p>
    </PanelShell>
  );
};

/** Step 3 — mentor/advisor introductions that follow the report. */
const IntroductionsPanel = () => {
  const { stats, isReady } = useEcosystemStats();
  const { data: mentors } = useJourneyMentors();

  return (
    <PanelShell>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Handshake className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Mentor &amp; advisor introductions</div>
          <div className="text-xs text-muted-foreground">
            {isReady && stats
              ? `${displayCount(stats.mentors)}+ mentors who have entered or scaled in ANZ`
              : "Mentors who have entered or scaled in ANZ"}
          </div>
        </div>
      </div>

      <ul className="mb-4 space-y-2" aria-label="Example mentors">
        {(mentors ?? []).map((mentor, index) => {
          const identity = {
            name: mentor.name ?? "Verified Expert",
            title: mentor.title ?? "",
            is_anonymous: mentor.is_anonymous ?? true,
          };
          const initials = mentorInitials(identity);
          const photo = mentor.avatar_url || mentor.image;
          return (
            <li
              key={mentor.id ?? index}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials ?? <Globe className="h-4 w-4" aria-hidden="true" />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {mentorDisplayName(identity)}
                </div>
                {identity.title && (
                  <div className="truncate text-xs text-muted-foreground">{identity.title}</div>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                  index === 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index === 0 ? "Connected" : "Intro requested"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5 text-accent" />
        <span>
          Profiles shown are real, public mentor profiles — anonymised mentors stay anonymised here,
          exactly as on the mentors directory.
        </span>
      </div>
    </PanelShell>
  );
};

const STEPS: { key: JourneyStepKey; label: string; number: string }[] = [
  { key: "report", label: "Your report", number: "1" },
  { key: "leads", label: "Providers & leads", number: "2" },
  { key: "introductions", label: "Introductions", number: "3" },
];

/**
 * Three-step value-journey proof section (MES-162, flag `hero_journey`,
 * placement Option B): the report output, the matched provider/lead list it
 * produces, and the mentor introductions that follow — every panel fed by the
 * real config and live records the product itself renders from. Keyboard and
 * screen-reader accessible via Radix tabs; no auto-advance (deliberate — a
 * static stepper needs no reduced-motion handling).
 */
export const HeroJourneySection = () => {
  const firedSteps = useRef(new Set<JourneyStepKey>());
  const activeStepRef = useRef<JourneyStepKey>("report");
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.25 });

  const fireStepViewed = (step: JourneyStepKey) => {
    if (firedSteps.current.has(step)) return;
    firedSteps.current.add(step);
    trackFunnelEvent("hero_journey_step_viewed", {
      source: JOURNEY_SOURCE,
      metadata: { step },
    });
  };

  useEffect(() => {
    if (isVisible) fireStepViewed(activeStepRef.current);
  }, [isVisible]);

  return (
    <section ref={elementRef} aria-labelledby="hero-journey-heading" className="bg-muted/20">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 id="hero-journey-heading" className="text-2xl font-bold text-foreground lg:text-3xl">
            From questionnaire to connected
          </h2>
          <p className="mt-3 text-muted-foreground">
            One free report kicks off the whole journey: personalised market intelligence, the
            providers and lead lists matched to it, and the people who can open doors.
          </p>
        </div>

        <Tabs
          defaultValue="report"
          onValueChange={(value) => {
            const step = value as JourneyStepKey;
            activeStepRef.current = step;
            fireStepViewed(step);
          }}
          className="mx-auto max-w-3xl"
        >
          <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 bg-muted/50 p-1">
            {STEPS.map((step) => (
              <TabsTrigger
                key={step.key}
                value={step.key}
                className="flex items-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm"
              >
                <span
                  className="hidden h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary sm:flex"
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="report">
            <ReportPanel />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsPanel />
          </TabsContent>
          <TabsContent value="introductions">
            <IntroductionsPanel />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link
            to={REPORT_CREATOR_PATH}
            onClick={() =>
              trackFunnelEvent("hero_cta_clicked", {
                source: JOURNEY_SOURCE,
                metadata: { cta: "journey_section" },
              })
            }
          >
            <Button
              size="lg"
              className="group rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-white soft-shadow transition-all duration-300 hover:from-primary/90 hover:to-accent/90 hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                Start with your free report
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroJourneySection;
