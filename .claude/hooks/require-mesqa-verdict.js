// PreToolUse gate for mcp__github__create_pull_request — LAYER 2 (deterministic).
//
// A PR cannot be opened (the last step, when it's handed off for merge) unless
// its body carries a FULL mes-qa exam verdict: a verdict word (Approve / Approve
// with conditions / Block) AND explicit Critical and Warning counts. Requiring
// the counts — not just "Approve" — forces the exam to have actually produced a
// per-severity result, not a one-word rubber stamp.
//
// This is the fast, free, fail-safe backstop. LAYER 1 (an `agent`-type hook in
// settings.json) independently RUNS a full mes-qa over the diff and blocks on any
// unresolved Critical/Warning — that's the real enforcement; this guarantees the
// verdict is recorded where the owner reads it even if the agent hook is skipped.
//
// Honest scope: this checks the verdict ARTIFACT shape, not the reasoning. Layer 1
// + the standing rule (run the mes-qa skill last, always) do the substantive work.
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let body = '';
  try {
    body = String(JSON.parse(raw).tool_input?.body ?? '');
  } catch {
    body = '';
  }
  const hasVerdictWord = /mes[-\s]?qa[\s\S]{0,120}?(approve|block|with conditions|conditions)/i.test(body);
  const hasCritical = /\d+\s*critical/i.test(body);
  const hasWarning = /\d+\s*warning/i.test(body);
  const ok = hasVerdictWord && hasCritical && hasWarning;

  const missing = [
    hasVerdictWord ? null : 'a mes-qa verdict (Approve / Approve with conditions / Block)',
    hasCritical ? null : 'an explicit Critical count (e.g. "0 Critical")',
    hasWarning ? null : 'an explicit Warning count (e.g. "0 Warning")',
  ].filter(Boolean).join(', and ');

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: ok ? 'allow' : 'deny',
        permissionDecisionReason: ok
          ? 'PR body carries a full mes-qa verdict.'
          : `Run the FULL mes-qa exam (the last step before opening a PR) and put its verdict in the body — missing ${missing}.`,
      },
    })
  );
});
