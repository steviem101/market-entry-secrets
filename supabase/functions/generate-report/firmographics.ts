/**
 * ICP firmographics → structured prompt signal (MES-235).
 *
 * The intake collects customer_type / customer_size / buying_motion as chips, but
 * generate-report never read the columns — they were "dead fields" (MES-213 finding 4).
 * The only place they reached was a lossy synthesised one-liner ("B2B customers —
 * Mid-market (50-500) — via direct sales — in Fintech") that fed Perplexity context
 * AND corrupted the ICP Target-Roles parse (parseIcpDescription read that soup).
 *
 * This module turns the three structured chips into a clean, labelled note with a
 * go-to-market steer per size and per motion, so the signal DEMONSTRABLY changes the
 * prose (lead-list shape, action-plan channel, sales-cycle framing) rather than
 * decorating it. Explicit label-value pairs stay grammatical for ANY subset of the
 * three chips. Empty in → empty note (an absent block never reads "Not specified").
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like buyerBriefs.ts / matchScoring.ts.
 */

export interface Firmographics {
  /** B2B | B2C | B2G | Mixed (intakeSchema.v2 CUSTOMER_TYPE) */
  customer_type?: string | null;
  /** SMB (<50) | Mid-market (50-500) | Enterprise (500+) | Mixed (CUSTOMER_SIZE) */
  customer_size?: string | null;
  /** Direct sales | Channel / partners | Self-serve / marketplace | Mixed (BUYING_MOTION) */
  buying_motion?: string | null;
}

const clean = (s: unknown): string => String(s ?? "").replace(/\s+/g, " ").trim();

/**
 * Sales-cycle / buying-process framing per customer size — makes size ACTIONABLE
 * so a different size visibly changes the action-plan guidance (not decorative).
 * Every size steer opens with "Expect " (the test asserts its presence/absence on that).
 */
function sizeSteer(size: string): string {
  const s = size.toLowerCase();
  if (s.startsWith("enterprise")) return "Expect long, procurement-led enterprise cycles (security review, multiple stakeholders) — weight the plan toward account-based selling and reference proof.";
  if (s.startsWith("smb")) return "Expect short, high-velocity SMB cycles — weight the plan toward volume, low-touch conversion and fast time-to-value.";
  if (s.startsWith("mid")) return "Expect mid-market cycles with a small buying committee — balance sales efficiency with light-touch relationship selling.";
  return ""; // "Mixed" → no single steer
}

/**
 * Go-to-market steer per buying motion — the highest-leverage firmographic: it
 * should reshape the lead-list and channel recommendation, so each motion emits a
 * distinct instruction (a channel seller must not be pushed a direct-outbound plan).
 * Every motion steer opens with "Prioritise " (the test asserts on that).
 */
function motionSteer(motion: string): string {
  const m = motion.toLowerCase();
  if (m.startsWith("direct")) return "Prioritise a direct outbound sales motion — named-account targeting, a defined sales process, and lead lists of specific buying-committee titles.";
  if (m.startsWith("channel")) return "Prioritise a channel / partner motion — reseller, distributor and integration-partner recruitment over pure direct outbound; frame the lead list around partner prospects.";
  if (m.startsWith("self")) return "Prioritise a product-led, self-serve motion — low-friction onboarding, marketplace/app-store presence and volume demand generation over high-touch sales.";
  return ""; // "Mixed" → no single steer
}

/**
 * Build the buyer-firmographics section-prompt note. Injected into the company-context
 * note (so every section sees it). Returns "" when the user gave no firmographic signal.
 */
export function buildFirmographicsNote(f: Firmographics | null | undefined): string {
  const type = clean(f?.customer_type);
  const size = clean(f?.customer_size);
  const motion = clean(f?.buying_motion);

  // Explicit label-value pairs — grammatical for any subset (customer_type can be absent
  // while size/motion are present), and an unambiguous, parseable signal for the model.
  const labels: string[] = [];
  if (type) labels.push(`Customer type: ${type}`);
  if (size) labels.push(`Customer size: ${size}`);
  if (motion) labels.push(`Buying motion: ${motion}`);
  if (labels.length === 0) return ""; // no signal → no block (never "Not specified")

  const steers = [sizeSteer(size), motionSteer(motion)].filter(Boolean).join(" ");
  const steerText = steers ? ` ${steers}` : "";
  return `\n\nBUYER FIRMOGRAPHICS (from the intake — reflect these in go-to-market, lead-list and action-plan guidance): ${labels.join("; ")}.${steerText} Ground the recommendations in this buyer profile and do not contradict it (e.g. never propose a self-serve funnel for an enterprise, procurement-led buyer).`;
}
