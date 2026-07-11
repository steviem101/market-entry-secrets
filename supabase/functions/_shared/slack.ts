// Slack mrkdwn escaping for untrusted text. Slack parses &, <, > as control sequences
// (<!channel>/<!here> pings, <url|masked links>), so anything user-submitted or
// AI-generated (intake company names, judge-written proposal titles/changes) must be
// escaped before interpolation into message text — per Slack's own guidance.
export function escapeSlack(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
