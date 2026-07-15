// PreToolUse gate for mcp__github__create_pull_request.
//
// Enforces the mandatory pre-merge QA: a PR cannot be opened (the point at which
// it's "finished, prior to merge") unless its body carries a mes-qa exam verdict
// — Approve / Approve with conditions / Block. This forces the mes-qa skill to
// have been run at PR time and its verdict recorded where the owner reads it.
//
// Honest scope: this checks that the verdict ARTIFACT is present in the body, not
// that the audit reasoning genuinely happened — it makes skipping a deliberate
// act rather than an easy omission, paired with the standing rule to run /mes-qa.
// Fails safe: no body / no verdict marker => deny with an instruction to run it.
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let body = '';
  try {
    body = String(JSON.parse(raw).tool_input?.body ?? '');
  } catch {
    body = '';
  }
  // Require "mes-qa" (or "mes qa") followed, within a short span, by an explicit
  // verdict word. Matches "mes-qa verdict: Approve", "mes-qa: Block", etc.
  const hasVerdict = /mes[-\s]?qa[\s\S]{0,80}?(approve|block|with conditions|conditions)/i.test(body);
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: hasVerdict ? 'allow' : 'deny',
        permissionDecisionReason: hasVerdict
          ? 'PR body carries a mes-qa verdict.'
          : 'Run the mes-qa exam (invoke the mes-qa skill) and include its verdict (Approve / Approve with conditions / Block) in the PR body before opening the PR.',
      },
    })
  );
});
