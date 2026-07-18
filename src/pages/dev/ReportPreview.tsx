import { useSearchParams, Link } from "react-router-dom";
import type { Report } from "@/types/report";
import { REPORT_V2_SECTIONS } from "@/components/report-v2/sectionRegistry";
import ReportShell from "@/components/report-v2/ReportShell";
import SectionCard from "@/components/report-v2/SectionCard";
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

/**
 * Dev-only acceptance harness for the report_v2 renderer (DECISIONS #13).
 * Loads a fixture through the Report type and renders every section in
 * registry order — unbuilt sections appear as labeled placeholders. The
 * route is registered only when import.meta.env.DEV; it never ships.
 */
const ReportPreview = () => {
  const [searchParams] = useSearchParams();
  const fixtureKey = searchParams.get("fixture") ?? "floats";
  const report = FIXTURES[fixtureKey];

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
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Dev harness · fixture:
        </span>
        {FIXTURE_NAMES.map((name) => (
          <Link
            key={name}
            to={`/dev/report-preview?fixture=${name}`}
            className={
              name === fixtureKey
                ? "font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
                : "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground underline"
            }
          >
            {name}
          </Link>
        ))}
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {report.meta.customer} · {report.meta.archetype}
        </span>
      </div>

      <ReportShell>
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
