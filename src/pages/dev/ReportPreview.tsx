import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { Report } from "@/types/report";
import { REPORT_V2_SECTIONS } from "@/components/report-v2/sectionRegistry";
import ReportShell from "@/components/report-v2/ReportShell";
import SectionCard from "@/components/report-v2/SectionCard";
import EvidenceChip from "@/components/report-v2/EvidenceChip";
import Rich from "@/components/report-v2/Rich";
import floatsJson from "@/fixtures/floats.json";
import noryJson from "@/fixtures/nory.json";
import lemlistJson from "@/fixtures/lemlist.json";

// JSON imports arrive type-widened (e.g. literal unions become string); the
// fixtures are strictly validated against Report in the handoff STEP 2 check.
const FIXTURES: Record<string, Report> = {
  floats: floatsJson as unknown as Report,
  nory: noryJson as unknown as Report,
  lemlist: lemlistJson as unknown as Report,
};

const FIXTURE_NAMES = Object.keys(FIXTURES);

/** Recursively collect every string in the report that carries a chip token. */
function collectChipStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (value.includes("{chip:")) out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectChipStrings(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectChipStrings(item, out);
  }
  return out;
}

/**
 * Dev-only acceptance harness for the report_v2 renderer (DECISIONS #13).
 * Loads a fixture through the Report type and renders every section in
 * registry order — unbuilt sections appear as labeled placeholders. The
 * route is registered only when import.meta.env.DEV; it never ships.
 */
const ReportPreview = () => {
  const [searchParams] = useSearchParams();
  const fixtureKey = searchParams.get("fixture") ?? "floats";
  const [realReport, setRealReport] = useState<Report | null>(null);
  const [realError, setRealError] = useState<string | null>(null);

  // ?fixture=real — PARITY row 19: render a REAL production report through the
  // adapter. Drop the pipeline report_json (or a whole user_reports row) at
  // dev-fixtures/real-report.json (repo root, gitignored, served only by the
  // dev server — never copied into a build); the mismatch log prints to the
  // console.
  useEffect(() => {
    if (fixtureKey !== "real") return;
    let cancelled = false;
    setRealReport(null);
    setRealError(null);
    Promise.all([
      fetch("/dev-fixtures/real-report.json").then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      }),
      import("@/lib/report-v2/adapter"),
    ])
      .then(([raw, { adaptPipelineReport }]) => {
        if (cancelled) return;
        // Accept either a bare report_json or a whole user_reports row (whose
        // report_json may itself be a JSON string in some exports).
        let reportJson: unknown = raw.report_json ?? raw;
        if (typeof reportJson === "string") {
          try {
            reportJson = JSON.parse(reportJson);
          } catch {
            setRealError("dev-fixtures/real-report.json: report_json is a string that isn't valid JSON.");
            return;
          }
        }
        const context = raw.context ?? {
          tier: raw.tier_at_generation,
          date: raw.created_at,
          domain: raw.website_url,
          keyQuestion: raw.report_focus,
        };
        const { report: adapted, mismatches } = adaptPipelineReport(reportJson as never, context as never);
        console.info(`[report-v2 adapter] ${mismatches.length} mismatches`, mismatches);
        setRealReport(adapted);
      })
      .catch(() => {
        if (!cancelled) {
          setRealError("No dev-fixtures/real-report.json found — drop a production report_json there (path is gitignored, dev-only).");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fixtureKey]);

  const report =
    fixtureKey === "real"
      ? realReport
      : Object.prototype.hasOwnProperty.call(FIXTURES, fixtureKey)
        ? FIXTURES[fixtureKey]
        : undefined;

  const chipSpecimens = useMemo(() => (report ? collectChipStrings(report).slice(0, 6) : []), [report]);

  if (fixtureKey === "real" && !report) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted-foreground">{realError ?? "Adapting real report…"}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted-foreground">
          Unknown fixture "{fixtureKey}". Use one of:{" "}
          {FIXTURE_NAMES.map((name) => (
            <Link key={name} className="mr-2 underline" to={`/dev/report-preview?fixture=${name}`}>
              {name}
            </Link>
          ))}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto my-6 flex max-w-[1240px] flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Dev harness · fixture:
        </span>
        {[...FIXTURE_NAMES, "real"].map((name) => (
          <Link
            key={name}
            to={`/dev/report-preview?fixture=${name}`}
            className={
              name === fixtureKey
                ? "text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
                : "text-[11px] uppercase tracking-[0.14em] text-muted-foreground underline"
            }
          >
            {name}
          </Link>
        ))}
        <span className="ml-auto text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {report.meta.customer} · {report.meta.archetype}
        </span>
      </div>

      {/* Dev-only specimen strip: fixture paragraphs carrying a {chip:} token,
          rendered through Rich so chipped numbers are reviewable before their
          sections are built (ticket 2 done-check). */}
      <div className="mx-auto mb-6 max-w-[1240px] rounded-lg border border-border bg-muted/50 px-4 py-3">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Chip specimens · <EvidenceChip chip="sourced" /> sourced · <EvidenceChip chip="est" /> ·{" "}
          <EvidenceChip chip="inferred" />
        </p>
        {chipSpecimens.map((text, i) => (
          <Rich key={i} text={text} className="text-[13px] leading-[1.65] text-report-ink" />
        ))}
      </div>

      {/* key on fixture identity so switching fixtures remounts the section
          tree, clearing per-card interaction state (star/request/asset-load)
          that would otherwise stick to tree position. */}
      <ReportShell key={fixtureKey}>
        {REPORT_V2_SECTIONS.map(({ id, label, Component }) =>
          Component ? (
            <Component key={id} report={report} />
          ) : (
            <SectionCard key={id} label={label}>
              <p className="mt-2 text-sm text-report-caption">
                Placeholder — component not built yet.
              </p>
            </SectionCard>
          )
        )}
      </ReportShell>
    </div>
  );
};

export default ReportPreview;
