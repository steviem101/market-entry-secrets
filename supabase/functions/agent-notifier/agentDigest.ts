// agent-notifier — pure digest + Block Kit builders (no IO, tested in agentDigest.test.ts).
//
// The daily agent-loops digest is the Slack side of the dashboard: it rolls up the last 24h of
// runs and proposals, links back to /admin/agents, posts Approve/Reject cards for the proposals
// that still need a human, and raises an alert when volume spikes or a run fails. All the shaping
// lives here so the wording, thresholds, and button encoding are deterministically testable.
//
// No em or en dashes in any Slack copy (house rule): commas, colons, parentheses only.

export interface RunLite { loop: string; status: string; proposed: number | null; }
export interface ProposalLite {
  proposal_key: string; loop_name: string; action_type: string; status: string; reason: string;
}

export interface DigestSummary {
  totalRuns: number;
  failedRuns: number;
  proposedByLoop: Array<{ loop: string; count: number }>;
  totalProposed: number;
  pendingTotal: number;
}

export function buildDigestSummary(runs24h: RunLite[], proposals24h: ProposalLite[], pendingTotal: number): DigestSummary {
  const proposedByLoopMap = new Map<string, number>();
  for (const p of proposals24h) proposedByLoopMap.set(p.loop_name, (proposedByLoopMap.get(p.loop_name) ?? 0) + 1);
  const proposedByLoop = Array.from(proposedByLoopMap.entries())
    .map(([loop, count]) => ({ loop, count }))
    .sort((a, b) => b.count - a.count || a.loop.localeCompare(b.loop));
  return {
    totalRuns: runs24h.length,
    failedRuns: runs24h.filter((r) => r.status === "failed").length,
    proposedByLoop,
    totalProposed: proposals24h.length,
    pendingTotal,
  };
}

/** Button value encoding shared with rq-slack-actions (which decodes it). */
export function encodeButtonValue(action: "approve" | "reject", proposalKey: string): string {
  return `agent:${action}:${proposalKey}`;
}

/** Slack Block Kit for the daily digest header + counts + a deep link to the dashboard. */
export function buildDigestBlocks(summary: DigestSummary, dashboardUrl: string): unknown[] {
  const loopLines = summary.proposedByLoop.length === 0
    ? "_No new proposals in the last 24 hours._"
    : summary.proposedByLoop.map((l) => `• *${l.loop}*: ${l.count}`).join("\n");
  return [
    { type: "header", text: { type: "plain_text", text: "MES agent loops, daily digest", emoji: true } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Runs (24h):* ${summary.totalRuns}${summary.failedRuns > 0 ? ` (${summary.failedRuns} failed)` : ""}` },
        { type: "mrkdwn", text: `*Proposed (24h):* ${summary.totalProposed}` },
        { type: "mrkdwn", text: `*Pending review:* ${summary.pendingTotal}` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: `*New proposals by loop:*\n${loopLines}` } },
    { type: "actions", elements: [
      { type: "button", text: { type: "plain_text", text: "Open dashboard", emoji: true }, url: dashboardUrl },
    ] },
    { type: "context", elements: [{ type: "mrkdwn", text: "Approve or reject below, or in the dashboard. State lives in agent_proposals, so both stay in sync." }] },
  ];
}

/** A compact Approve/Reject card per proposal that still needs a human (non-auto-approved, pending). */
export function buildProposalCardBlocks(p: ProposalLite): unknown[] {
  const reason = p.reason.length > 280 ? `${p.reason.slice(0, 277)}...` : p.reason;
  return [
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${p.loop_name}* • \`${p.action_type}\`\n${reason}` },
    },
    {
      type: "actions",
      elements: [
        { type: "button", style: "primary", text: { type: "plain_text", text: "Approve", emoji: true }, value: encodeButtonValue("approve", p.proposal_key), action_id: "agent_approve" },
        { type: "button", style: "danger", text: { type: "plain_text", text: "Reject", emoji: true }, value: encodeButtonValue("reject", p.proposal_key), action_id: "agent_reject" },
      ],
    },
  ];
}

/**
 * Volume anomaly: today's proposal count is at least `factor` times the trailing daily average and
 * above a small floor (so 1 vs 0 never trips). Returns null when there is nothing to flag.
 */
export function detectAnomaly(todayCount: number, trailingDailyAvg: number, factor = 3, floor = 20): string | null {
  if (todayCount < floor) return null;
  if (trailingDailyAvg <= 0) return null;
  if (todayCount >= factor * trailingDailyAvg) {
    return `Proposal volume spike: ${todayCount} in 24h vs a trailing average of ${trailingDailyAvg.toFixed(1)}/day (>= ${factor}x).`;
  }
  return null;
}
