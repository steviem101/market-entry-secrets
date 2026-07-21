import type { ReactNode } from "react";
import type { AdminReportIntake, AdminReportQualityDetail } from "@/lib/api/reportApi";
import { Badge } from "@/components/ui/badge";

// ── shared helpers ────────────────────────────────────────────────────────
const RAG_LABELS: Record<string, string> = {
  service_providers: "Providers",
  community_members: "Mentors",
  events: "Events",
  content_items: "Content",
  case_studies: "Case Studies",
  leads: "Leads",
  innovation_ecosystem: "Innovation",
  trade_investment_agencies: "Agencies",
  investors: "Investors",
};

const scoreTone = (v: number | null | undefined) =>
  v == null
    ? "text-muted-foreground"
    : v >= 80
    ? "text-emerald-600 dark:text-emerald-400"
    : v >= 60
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

const num = (o: Record<string, unknown> | null | undefined, k: string): number | null => {
  const v = o?.[k];
  return typeof v === "number" ? v : null;
};
const str = (o: Record<string, unknown> | null | undefined, k: string): string | null => {
  const v = o?.[k];
  return typeof v === "string" && v.trim() ? v : null;
};
const strArr = (o: Record<string, unknown> | null | undefined, k: string): string[] => {
  const v = o?.[k];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
};
const boolish = (o: Record<string, unknown> | null | undefined, k: string): boolean => o?.[k] === true;

const Field = ({ label, value }: { label: string; value: ReactNode }) =>
  value ? (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  ) : null;

const list = (v: string[] | null | undefined) => (v && v.length ? v.join(", ") : null);

/** Only http(s) URLs become links — a customer-supplied `javascript:`/`data:`
 * href would otherwise execute in the admin's session when clicked. */
const safeHref = (url: string | null | undefined): string | null =>
  url && /^https?:\/\//i.test(url.trim()) ? url.trim() : null;

// ── Intake: what the customer actually asked for ──────────────────────────
export const IntakePanel = ({ intake }: { intake: AdminReportIntake | null }) => {
  if (!intake) return null;
  const competitors = Array.isArray(intake.known_competitors)
    ? intake.known_competitors.map((c) => c?.name).filter(Boolean).join(", ")
    : "";
  const challenges = [list(intake.challenge_tags), intake.challenge_other, intake.key_challenges]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">What the customer asked for</h2>
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        <Field
          label="Company"
          value={(() => {
            const href = safeHref(intake.website_url);
            return href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary"
              >
                {intake.company_name || href}
              </a>
            ) : (
              intake.company_name || intake.website_url
            );
          })()}
        />
        <Field label="From" value={intake.country_of_origin} />
        <Field label="Industry" value={list(intake.industry_sector)} />
        <Field label="Target regions" value={list(intake.target_regions)} />
        <Field label="Stage" value={intake.company_stage || intake.revenue_stage} />
        <Field label="Team size" value={intake.employee_count} />
        <Field label="Goals" value={list(intake.services_needed) || list(intake.goal_ids)} />
        <Field label="Timeline" value={intake.timeline} />
        <Field label="Budget" value={intake.budget_level} />
        <Field
          label="Buyer"
          value={[intake.customer_type, intake.customer_size, intake.buying_motion]
            .filter(Boolean)
            .join(" · ")}
        />
        <Field label="End-buyer industries" value={list(intake.end_buyer_industries)} />
        <Field label="Known competitors" value={competitors} />
        <Field label="Report focus" value={intake.report_focus} />
        <Field label="Challenges" value={challenges} />
      </dl>
    </section>
  );
};

// ── Quality: the #report-quality breakdown, in-panel ──────────────────────
const ScorePill = ({ label, value }: { label: string; value: number | null }) => (
  <div className="flex flex-col items-center rounded-md border px-3 py-2 min-w-[84px]">
    <span className={`text-xl font-bold tabular-nums ${scoreTone(value)}`}>{value ?? "—"}</span>
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
  </div>
);

export const QualityPanel = ({ quality }: { quality: AdminReportQualityDetail | null }) => {
  if (!quality) {
    return (
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">Quality breakdown</h2>
        <p className="text-sm text-muted-foreground">
          No quality run has been recorded for this report yet.
        </p>
      </section>
    );
  }

  const sub = quality.substance;
  const rubric = (["relevance", "specificity", "actionability", "groundedness", "coherence"] as const).map(
    (k) => ({ k, v: num(sub, k) })
  );
  const oneLiner = str(sub, "one_liner");
  const insights = Array.isArray(quality.insights)
    ? quality.insights.filter((x): x is string => typeof x === "string")
    : [];
  const presFlags = strArr(quality.presentation, "flags");
  const util = quality.utilization;
  const dropped = strArr(util, "dropped").map((c) => RAG_LABELS[c] ?? c);
  const gated = strArr(util, "gated").map((c) => RAG_LABELS[c] ?? c);
  const s = quality.sources;
  const genSecs = quality.generation_time_ms ? Math.round(quality.generation_time_ms / 1000) : null;
  const matchCounts = quality.match_counts ?? {};

  return (
    <section className="rounded-lg border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Quality breakdown</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {quality.degraded && (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/40">
              degraded
            </Badge>
          )}
          {genSecs != null && <span>generated in {genSecs}s</span>}
        </div>
      </div>

      {/* Headline scores */}
      <div className="flex flex-wrap gap-2">
        <ScorePill label="Report" value={quality.report_score} />
        <ScorePill label="Build" value={quality.build_health} />
        <ScorePill label="Substance" value={quality.score_substance} />
        <ScorePill label="Presentation" value={quality.score_presentation} />
      </div>
      <p className="text-xs text-muted-foreground">
        Build = Plumbing {quality.score_plumbing ?? "—"} · Coverage {quality.score_coverage ?? "—"} ·
        Completeness {quality.score_completeness ?? "—"}
      </p>

      {/* Substance rubric */}
      {sub && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Substance rubric</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {rubric.map(({ k, v }) => (
              <span key={k} className="capitalize">
                {k} <span className={`font-medium ${scoreTone(v != null ? v * 20 : null)}`}>{v ?? "—"}/5</span>
              </span>
            ))}
          </div>
          {oneLiner && <p className="mt-2 text-sm italic text-muted-foreground">“{oneLiner}”</p>}
        </div>
      )}

      {/* Suggested fixes — the actionable part */}
      {insights.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Suggested fixes (plumbing / prompts / taxonomy)
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Plumbing */}
      {s && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Plumbing</p>
          <p className="text-sm text-foreground">
            Company scrape {boolish(s, "company_scrape") ? "✓" : "✗"} · Perplexity{" "}
            {boolish(s, "perplexity_used") ? "✓" : "✗"} · {num(s, "citations") ?? 0} citations ·{" "}
            {num(s, "key_metrics") ?? 0} key metrics · {num(s, "providers_enriched") ?? 0} providers ·{" "}
            {num(s, "competitors_found") ?? 0} competitors · polish{" "}
            {boolish(s, "polish_applied") ? "applied" : "skipped"}
          </p>
        </div>
      )}

      {/* RAG coverage */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          RAG coverage — {quality.tables_hit ?? 0}/9 data types · {quality.total_matches ?? 0} matches
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {Object.keys(RAG_LABELS).map((k) => (
            <span key={k} className={(matchCounts[k] ?? 0) > 0 ? "text-foreground" : "text-muted-foreground"}>
              {RAG_LABELS[k]} {matchCounts[k] ?? 0}
            </span>
          ))}
        </div>
      </div>

      {/* Utilisation */}
      {util && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Utilisation{" "}
            {quality.utilization_rate != null ? `${Math.round(quality.utilization_rate * 100)}%` : "—"} of
            surfaced items used in the report
          </p>
          {dropped.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Dropped (surfaced, never used): {dropped.join(", ")}
            </p>
          )}
          {gated.length > 0 && (
            <p className="text-sm text-muted-foreground">Gated at tier: {gated.join(", ")}</p>
          )}
        </div>
      )}

      {/* Presentation flags */}
      {presFlags.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Presentation flags</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">{presFlags.join(" · ")}</p>
        </div>
      )}
    </section>
  );
};
