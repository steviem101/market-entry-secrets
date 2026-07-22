import { formatDistanceToNow } from "date-fns";

/**
 * Null- AND Invalid-Date-safe relative time. The agent_proposals view can deliver a null
 * created_at (trade_agencies_enrichment_staging allows it), and date-fns throws a RangeError on
 * an Invalid Date — one bad row must never crash a whole admin surface. Shared by the
 * /admin/agents components so both call sites get the same guard.
 */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "unknown" : formatDistanceToNow(d, { addSuffix: true });
}
