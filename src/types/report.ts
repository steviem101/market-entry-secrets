// Report content contracts — drop into src/types/report.ts (or equivalent).
// The renderer consumes ONLY this shape. The Phase-A adapter maps current
// pipeline output into it. Optional fields degrade per README rules — the
// renderer must never throw on a missing optional.

export type Chip = "sourced" | "est" | "inferred";

/**
 * Paragraph = markdown-lite string. EXACTLY three constructs, nothing else:
 *   **bold**                        → <strong>
 *   [text](/path)                   → entity link (new tab, resolved via routes map)
 *   {chip:sourced|est|inferred}     → inline EvidenceChip immediately after the preceding token
 * No headings, no lists, no raw HTML. Renderer: single regex pass, escape everything else.
 */
export type Paragraph = string;

export type EntityKind =
  | "provider" | "hub" | "investor" | "mentor" | "event"
  | "account" | "competitor" | "org" | "dataset";

export interface EntityRef {
  name: string;
  url: string;            // platform-relative path, e.g. "/investors/aura-ventures" — see routes map in adapter
  kind: EntityKind;
  why?: string;
}

export interface MatchCard extends EntityRef {
  tag: string;            // small-caps role tag, may be ""
  description: string;
  logoUrl?: string;       // "platform:<slug>" = resolve from profile assets; absent = monogram fallback
}

export interface PersonCard extends EntityRef {
  role: string;           // mono caps line
  why: string;
  headshotUrl?: string;   // same resolution rule as logoUrl
}

export interface RankedItem extends EntityRef {
  rank: 1 | 2 | 3;
  meta: string;           // "Sydney · law firm"
  why: string;
  roleTag: string;
  logoUrl?: string;
}

export interface CompetitorRow extends EntityRef {
  positionTag: string;    // "ATS · AGENCIES"
  position: string;
  strengths: string;
  differs: string;        // verdict column — for `you`, this is the caps differentiator line
  auPresence?: boolean;
  logoUrl?: string;
}

export interface AccountBrief extends EntityRef {
  meta: string;                          // mono caps descriptor
  statusChips: ("hiring" | "tech")[];
  signals: string;
  stack: string;
  fit: string;
  approach: string[];                    // titles to approach
  angle: string;
  logoUrl?: string;
}

export interface StatTile { value: string; chip: Chip; caption: string; }
export interface SwotItem { lead: string; text: Paragraph; }

export interface TwoTierSection {
  intro: Paragraph;
  ourRead: RankedItem[];   // exactly the ranked read; length 1–3
  all: MatchCard[];        // the FULL match set — nothing the matcher surfaced is dropped
  // Honest-degradation caption (adapter): present ONLY when no match in this
  // section earned a sector/industry relevance score — states the basis the
  // matcher actually used, so a goal/service fallback never reads as sector-tailored.
  coverageNote?: string;
}

export interface Report {
  meta: {
    customer: string;
    domain?: string;               // powers logo.dev cover mark; absent = monogram
    location: string;
    descriptor: string;            // "MELBOURNE, VIC · 11–50 · RECRUITMENT SAAS"
    date: string;                  // ISO
    plan: "free" | "scale";
    archetype: "domestic_scaleup" | "foreign_entrant" | "startup_launch";
    origin?: string;               // foreign_entrant only: origin country ("Ireland", "France") — drives corridor modules (Business France vs Enterprise Ireland etc.)
    keyQuestion: string;           // customer's verbatim intake question
    sourceCount: number;
  };
  cover: { kicker: string; headline: string; scope: Paragraph; };
  exec: {
    narrative: Paragraph[];        // 2–3 paragraphs
    keyQuestionAnswer: Paragraph;
    highlights: EntityRef[];       // 1–3 flagged matches
    heroStat: { label: string; value: string; caption: Paragraph; chip: Chip; };
    sequence: { label: string; rows: { period: string; text: Paragraph }[]; caveat: string; };
  };
  metrics: { tiles: StatTile[]; footnote?: string; };   // 3–6 tiles, consistent geography+scope (R4)
  swot: { strengths: SwotItem[]; weaknesses: SwotItem[]; opportunities: SwotItem[]; threats: SwotItem[]; };
  competitors: {
    intro: Paragraph;
    you: CompetitorRow;
    rows: CompetitorRow[];         // ≥1; n=1 → single row + scan hook, never an empty table
    gaps: Paragraph;
    positioningRead: Paragraph;
    scanHookCopy?: string;         // absent = no scan hook
  };
  accounts: {
    intro: Paragraph;
    briefed: AccountBrief[];                          // MAY be empty (customer named no targets)
    unbriefed?: { name: string; reason: string }[];   // renders gap card + request button
    icpGuidance?: { targetRoles: string[]; sectorFocus: Paragraph; angle: Paragraph };
    // briefed=[] → render icpGuidance as an ICP-profile card + "name your targets" request hook.
    // NEVER render intake-apology prose (R5).
    worthKnowing: Paragraph;
  };
  providers: TwoTierSection;
  govAndHubs: {
    gov: { name: string; url: string; why: string }[];
    hubs: (MatchCard & { focusTag: string })[];
    alsoNamed?: Paragraph;
  };
  mentors: { intro: Paragraph; primary: PersonCard[]; extra?: PersonCard[]; advice?: Paragraph; coverageNote?: string; };
  investors: {
    intro: Paragraph;
    approachOrder: { label: string; text: Paragraph }[];   // framed as ONE POSSIBLE order (tone rule)
    all: (MatchCard & { stageTag: string; checkSize?: string; headshotUrl?: string })[];
    alsoNamed?: Paragraph;
    coverageNote?: string;   // see TwoTierSection.coverageNote
  };
  events: {
    cards: { date: string; venue: string; name: string; url: string; why: string }[];
    alsoFlagged?: Paragraph;
    maximise?: { lead: string; text: Paragraph }[];   // customer-specific "get value from these rooms" tips (≤3)
  };
  actionPlan: {
    intro: Paragraph;
    // exactly 3 phases; a phase is EITHER flat body OR grouped sub-blocks (never both)
    phases: { period: string; title: string; body?: Paragraph; groups?: { title: string; body: Paragraph }[] }[];
  };
  compliance: {
    intro: Paragraph;
    table: { requirement: string; severity: "red" | "amber" | "grey"; tag: string; finding: string; note: string }[];
    stats: StatTile[];
    checklist: { lead: string; text: Paragraph }[];
  };
  guides: {
    intro: Paragraph;
    cards: { title: string; url: string; summary: string; relevantBecause: string }[];
  };
  leads: {
    dataset?: { name: string; url: string; records: number; description: string };  // present → dataset card
    gapCopy?: string;                                                               // present → honest-gap card
    customBuildCopy: string;                                                        // always → request box
  };
  close: { headline: string; body: Paragraph; arriveWith: string[]; };  // 3–4 open decisions
  sources: { regulator: string[]; analyst: string[]; vendor: string[]; };
}

// ---- Interaction events (persistence contract, DECISIONS.md #5) ----
export type ReportInteraction =
  | { type: "star";          reportId: string; entity: EntityRef; on: boolean }
  | { type: "scan_request";  reportId: string }
  | { type: "brief_request"; reportId: string; accountName: string; domain?: string }
  | { type: "lead_request";  reportId: string; icpDescription: string };
