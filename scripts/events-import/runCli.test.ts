// MES-160 importer — black-box CLI tests for the write gate.
//
// The dry run is executed as a subprocess with NO Supabase credentials in its
// environment and snapshot files instead of live reads: if it succeeds, it
// provably performed no database writes (it had nothing to write with).
// The --apply gate is exercised the same way and must refuse.
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = join(HERE, "run.ts");

const CSV = [
  "event_name,event_date_start,event_date_end,next_edition_expected,venue,city,state,organiser,organiser_website,website_url,registration_url,description,target_audience,event_type,frequency,recurring,ticket_price_range_aud,expected_attendance,exhibitor_count,sector_tags,notes,source_url,notion_page_url",
  'CLI Test Expo,2026-09-01,,,ICC Sydney,Sydney,NSW,Test Org,,https://example.com,,"A test event.",Buyers,trade_exhibition,annual,true,,,,FinTech,,,https://app.notion.com/p/cli-test-1',
].join("\n") + "\n";

const TAXONOMY = JSON.stringify({
  vocab: [{ raw_value: "fintech", sector_slugs: ["financial-services"] }],
  // Must include every slug the repo sector-overrides.csv can produce for
  // labels used in this fixture (overrides are loaded by the CLI too).
  valid_slugs: ["financial-services", "technology-information-and-media"],
});

// Environment with every SUPABASE_* variable removed — no write capability.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !k.startsWith("SUPABASE")),
) as NodeJS.ProcessEnv;

function runCli(args: string[]): { status: number; output: string } {
  try {
    const out = execFileSync(process.execPath, [RUN, ...args], { env: CLEAN_ENV, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    return { status: 0, output: out };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

describe("run.ts CLI write gate", () => {
  let dir: string;
  let csvPath: string;
  let eventsSnap: string;
  let taxonomySnap: string;

  before(() => {
    dir = mkdtempSync(join(tmpdir(), "mes160-cli-"));
    csvPath = join(dir, "events.csv");
    eventsSnap = join(dir, "events-snapshot.json");
    taxonomySnap = join(dir, "taxonomy-snapshot.json");
    writeFileSync(csvPath, CSV);
    writeFileSync(eventsSnap, "[]");
    writeFileSync(taxonomySnap, TAXONOMY);
  });

  it("dry run succeeds without credentials and writes review artefacts", () => {
    const out = join(dir, "out");
    const res = runCli([
      "--csv", csvPath, "--batch-id", "cli-test",
      "--events-snapshot", eventsSnap, "--taxonomy-snapshot", taxonomySnap,
      "--out", out,
    ]);
    assert.equal(res.status, 0, res.output);
    assert.match(res.output, /DRY RUN — no database writes performed/);
    for (const f of ["inserts.csv", "updates.csv", "ambiguous.csv", "invalid.csv", "taxonomy-exceptions.csv", "summary.json", "proposals.json"]) {
      assert.ok(existsSync(join(out, f)), `expected artefact ${f}`);
    }
    const summary = JSON.parse(readFileSync(join(out, "summary.json"), "utf-8"));
    assert.equal(summary.counts.inserts, 1);
    assert.equal(summary.batch_id, "cli-test");
  });

  it("refuses --apply against snapshots", () => {
    const res = runCli([
      "--csv", csvPath, "--apply",
      "--events-snapshot", eventsSnap, "--taxonomy-snapshot", taxonomySnap,
    ]);
    assert.notEqual(res.status, 0);
    assert.match(res.output, /--apply must run against the live database/);
  });

  it("refuses --apply without credentials", () => {
    const res = runCli(["--csv", csvPath, "--apply"]);
    assert.notEqual(res.status, 0);
    assert.match(res.output, /SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required/);
  });

  it("refuses --rollback without credentials", () => {
    const res = runCli(["--rollback", "cli-test"]);
    assert.notEqual(res.status, 0);
    assert.match(res.output, /SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required/);
  });
});
