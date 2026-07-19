import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Globe,
  Handshake,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEcosystemStats } from "@/hooks/useEcosystemStats";
import { useFeaturedLogos } from "@/hooks/useFeaturedLogos";
import { useLeadDatabaseStats } from "@/hooks/useLeadDatabases";
import { displayCount } from "@/lib/heroStatsDisplay";
import { topLeadCategories, JOURNEY_STEP_ORDER, type JourneyStepKey } from "@/lib/heroJourney";
import { mentorDisplayName, mentorInitials } from "@/lib/mentorDisplay";
import { trackFunnelEvent } from "@/lib/analytics/intakeFunnel";
import {
  SECTION_ORDER,
  SECTION_LABELS,
  TIER_REQUIREMENTS,
} from "@/components/report/reportSectionConfig";
import { ManifestoStrip } from "@/components/sections/ManifestoStrip";
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
  slug: string | null;
}

// Owner-picked example mentors (18 Jul): shown in this order. All three are
// real, active, non-anonymous public profiles with photos — same PII-safe view
// the /mentors directory renders from. If a pinned profile is deactivated or
// anonymised it silently drops out and the curated is_featured pool backfills.
const PINNED_MENTOR_SLUGS = ["duco-van-breemen", "colm-dolan", "jacqui-duncan"];

const useJourneyMentors = () =>
  useQuery({
    queryKey: ["hero-journey-mentors", PINNED_MENTOR_SLUGS],
    queryFn: async (): Promise<JourneyMentor[]> => {
      const { data, error } = await supabase
        .from("community_members_public")
        .select("id, name, title, is_anonymous, avatar_url, image, slug")
        .eq("is_active", true)
        .in("slug", PINNED_MENTOR_SLUGS);
      if (error) throw error;
      const pinned = (data ?? [])
        .slice()
        .sort(
          (a, b) =>
            PINNED_MENTOR_SLUGS.indexOf(a.slug ?? "") - PINNED_MENTOR_SLUGS.indexOf(b.slug ?? ""),
        );
      if (pinned.length >= 3) return pinned.slice(0, 3);
      // Backfill from the admin-curated featured pool if a pinned profile is gone.
      const { data: fallback } = await supabase
        .from("community_members_public")
        .select("id, name, title, is_anonymous, avatar_url, image, slug")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(3);
      const seen = new Set(pinned.map((m) => m.slug));
      return [...pinned, ...(fallback ?? []).filter((m) => !seen.has(m.slug))].slice(0, 3);
    },
    staleTime: 30 * 60 * 1000,
  });

// A shared min-height keeps all three panels the same size, so auto-advancing
// between them (or clicking a shorter tab) never makes the section jump — sized
// to the tallest panel (step 1, the richest).
const PanelShell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm min-h-[420px]">
    {children}
  </div>
);

// Worked example (Canva) of the two most compelling report sections — an
// executive-summary verdict and a phased action plan. Qualitative only: no
// invented figures (grounding invariant), clearly labelled "Example". Chosen
// over a lone SWOT because the verdict conveys insight and the timeline
// conveys "a plan, not a PDF" — the report's actual payoff.
const EXAMPLE_ACTION_PLAN: { phase: string; window: string; detail: string }[] = [
  { phase: "Establish", window: "Weeks 1–3", detail: "Register the entity, GST and a local billing presence" },
  { phase: "Land", window: "Weeks 4–8", detail: "Warm-intro to vetted providers; first design-partner conversations" },
  { phase: "Expand", window: "Weeks 9–16", detail: "Enter education & government procurement panels via matched agencies" },
];

/**
 * Step 1 — the generated report as prose-quality proof. The full section
 * checklist lives in the hero graphic directly above, so this panel doesn't
 * repeat it (MES homepage de-dup, 18 Jul): it shows worked examples of the
 * report's most compelling sections (exec-summary verdict + action plan) and
 * grounds them in live directory counts.
 */
const ReportPanel = () => {
  const { stats, isReady } = useEcosystemStats();
  const gatedSections = SECTION_ORDER.filter((s) => TIER_REQUIREMENTS[s]);
  const freeCount = SECTION_ORDER.length - gatedSections.length;

  return (
    <PanelShell>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Your report is generated</div>
          <div className="text-xs text-muted-foreground">
            {SECTION_ORDER.length} sections &middot; {freeCount} free &middot; written for your company, not a template
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Example: Canva
        </span>
      </div>

      {/* Executive-summary verdict — the insight that leads the report. */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          {SECTION_LABELS.executive_summary}
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">
          Australia is a strong beachhead for a self-serve product like Canva — high card
          penetration and English-language fit let a freemium motion land fast — but enterprise
          and government deals favour incumbents with local procurement panels.
        </p>
      </div>

      {/* Action plan — the tangible "plan, not a PDF" payoff. */}
      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-foreground">
          <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
          {SECTION_LABELS.action_plan}
        </div>
        <ol className="space-y-2.5">
          {EXAMPLE_ACTION_PLAN.map((step, i) => (
            <li key={step.phase} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground">
                  {step.phase} <span className="font-normal text-muted-foreground">&middot; {step.window}</span>
                </div>
                <p className="text-xs leading-snug text-foreground/75">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        {isReady && stats
          ? `Grounded in ${displayCount(stats.serviceProviders)}+ providers, ${displayCount(stats.mentors)}+ mentors and ${displayCount(stats.investors)}+ investors from our live directories.`
          : "Every section is grounded in live market data and real directory records."}
      </p>
    </PanelShell>
  );
};

/**
 * Example lead-list rows illustrating the delivered CSV's format. Recognisable
 * Australian companies carry the credibility; the person-level cells (contact,
 * email, phone, LinkedIn) render as redaction bars — the same masking the real
 * lead-list previews use — so the panel never fabricates or implies possession
 * of any real individual's contact details (MES-162 PII rule). Clearly
 * labelled as an example of the format, not inventory.
 */
const EXAMPLE_LEAD_ROWS: { company: string; role: string }[] = [
  { company: "Atlassian", role: "Head of Partnerships" },
  { company: "Canva", role: "Procurement Lead" },
  { company: "Qantas", role: "Head of Innovation" },
  { company: "Telstra", role: "Enterprise Sales Director" },
];

// Masked placeholder cells: shaped like the real column (email / phone /
// LinkedIn) but obviously redacted with bullets — reads as "there's a contact
// here" without inventing or implying any real person's details (MES-162 PII
// rule; the panel's footnote says as much).
const MASKED_PLACEHOLDER = {
  email: "••••@••••.com",
  phone: "+61 4•• ••• •••",
  linkedin: "/in/••••••",
} as const;

const MaskedCell = ({ kind }: { kind: keyof typeof MASKED_PLACEHOLDER }) => (
  <span className="tracking-tight text-muted-foreground/70" aria-label="Masked in this example">
    {MASKED_PLACEHOLDER[kind]}
  </span>
);

/** Step 2 — the matched provider / lead list the report produces. Categories,
 * counts and confirmed-featured logos only — never real lead or user records. */
const LeadsPanel = () => {
  const { stats, isReady } = useEcosystemStats();
  const { data: logos } = useFeaturedLogos();
  const { data: leadStats } = useLeadDatabaseStats();
  // Drop any logo whose image fails to load (Logo.dev coverage miss) so it
  // never renders as a broken-image glyph — mirrors the main LogoCloud. Filter
  // before slicing so survivors backfill the row up to 6.
  const [failedLogos, setFailedLogos] = useState<ReadonlySet<string>>(new Set());

  const categories = topLeadCategories(leadStats?.countsByType, 4);
  const logoRow = (logos ?? []).filter((l) => !failedLogos.has(l.key)).slice(0, 6);

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
                onError={() =>
                  setFailedLogos((prev) => {
                    const next = new Set(prev);
                    next.add(logo.key);
                    return next;
                  })
                }
              />
            </li>
          ))}
        </ul>
      )}

      {/* Example CSV rows — the format a delivered lead list follows */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground">Your delivered CSV</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Example format
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Company</th>
                <th scope="col" className="px-3 py-2 font-medium">Role</th>
                <th scope="col" className="px-3 py-2 font-medium">Email</th>
                <th scope="col" className="px-3 py-2 font-medium">Phone</th>
                <th scope="col" className="px-3 py-2 font-medium">LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_LEAD_ROWS.map((row) => (
                <tr key={row.company} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-foreground">{row.company}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.role}</td>
                  <td className="px-3 py-2"><MaskedCell kind="email" /></td>
                  <td className="px-3 py-2"><MaskedCell kind="phone" /></td>
                  <td className="px-3 py-2"><MaskedCell kind="linkedin" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
        Illustrative rows — company-level examples only. Real deliveries contain your matched
        contacts; recommendations trace to real directory records, and we never display individual
        lead or member data here.
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

const AUTO_ADVANCE_MS = 5000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Three-step value-journey proof section (MES-162, flag `hero_journey`,
 * placement Option B): the report output, the matched provider/lead list it
 * produces, and the mentor introductions that follow — every panel fed by the
 * real config and live records the product itself renders from. Keyboard and
 * screen-reader accessible via Radix tabs.
 *
 * Auto-advances through the three steps (5s each) so the section feels alive on
 * landing, then STOPS permanently on the first manual interaction so a reader is
 * never yanked. Disabled entirely under prefers-reduced-motion, and paused while
 * the pointer is over the section. A thin progress bar signals the auto-advance.
 */
export const HeroJourneySection = () => {
  const firedSteps = useRef(new Set<JourneyStepKey>());
  const sectionRef = useRef<HTMLElement>(null);

  const [activeStep, setActiveStep] = useState<JourneyStepKey>("report");
  // Auto-advance runs until the first manual interaction, then stops for good.
  const [autoAdvance, setAutoAdvance] = useState(() => !prefersReducedMotion());
  const [paused, setPaused] = useState(false);
  // Live, TWO-WAY viewport tracking (unlike the one-shot useIntersectionObserver
  // latch): the timer must actually stop when the section scrolls off-screen or
  // the browser tab is hidden, not run forever after the first reveal.
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // threshold 0: in-view = any part visible, so it pauses only once the
    // section is fully off-screen (robust for a section taller than the
    // viewport, where a 0.25 ratio may never be reached).
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const fireStepViewed = (step: JourneyStepKey) => {
    if (firedSteps.current.has(step)) return;
    firedSteps.current.add(step);
    trackFunnelEvent("hero_journey_step_viewed", {
      source: JOURNEY_SOURCE,
      metadata: { step },
    });
  };

  // Emit the step-viewed event whenever the in-view step changes (covers both
  // auto-advance and manual clicks; fireStepViewed dedupes per step).
  useEffect(() => {
    if (inView) fireStepViewed(activeStep);
  }, [inView, activeStep]);

  // The auto-advance timer: only runs while enabled, on-screen, tab-visible and
  // not paused — so it genuinely idles when the section isn't being looked at.
  useEffect(() => {
    if (!autoAdvance || paused || !inView || !tabVisible) return;
    const id = setInterval(() => {
      setActiveStep((prev) => {
        const idx = JOURNEY_STEP_ORDER.indexOf(prev);
        return JOURNEY_STEP_ORDER[(idx + 1) % JOURNEY_STEP_ORDER.length];
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [autoAdvance, paused, inView, tabVisible]);

  // Any manual tab selection stops the auto-advance permanently.
  const handleValueChange = (value: string) => {
    setAutoAdvance(false);
    setActiveStep(value as JourneyStepKey);
  };

  const showProgress = autoAdvance && !paused && inView && tabVisible;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-journey-heading"
      className="bg-muted/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
          value={activeStep}
          onValueChange={handleValueChange}
          className="mx-auto max-w-3xl"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted/50 p-1">
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

          {/* Auto-advance progress bar — a keyed remount restarts the CSS
              animation each time the step changes; hidden once auto-advance
              stops (manual interaction / reduced-motion / paused). */}
          <div className="mb-6 mt-1.5 h-0.5 w-full overflow-hidden rounded bg-muted/60" aria-hidden="true">
            {showProgress && (
              <div
                key={activeStep}
                className="animate-journey-progress h-full bg-primary/50"
                style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
              />
            )}
          </div>

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

        {/* Closing argument — the X-not-Y manifesto (moved here from the
            retired How-it-works section; renders once per page). */}
        <ManifestoStrip className="mx-auto mt-10 max-w-3xl" />

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
