// PreToolUse gate for mcp__Supabase__execute_sql (prod DB xhziwveaiuhzdoutpgrh).
// Auto-allows plainly read-only queries; anything that could write, alter, or
// disrupt falls through to the normal permission prompt ("ask"). Fails safe:
// any parse doubt = ask. See .claude/settings.json hooks.
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let q = '';
  try {
    q = String(JSON.parse(raw).tool_input?.query ?? '');
  } catch {
    q = '';
  }
  const t = q.trim().replace(/;\s*$/, '');
  const startsReadOnly = /^(select|with|explain|show)\b/i.test(t);
  const singleStatement = !t.includes(';');
  const noWriteWords =
    !/\b(insert|update|delete|merge|truncate|alter|drop|create|grant|revoke|vacuum|reindex|cluster|copy|call|do|set|reset|refresh|comment|lock|listen|notify|into)\b/i.test(t) &&
    !/\bpg_(terminate|cancel|reload|rotate)/i.test(t);
  const readOnly = t.length > 0 && startsReadOnly && singleStatement && noWriteWords;
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: readOnly ? 'allow' : 'ask',
        permissionDecisionReason: readOnly
          ? 'Read-only SQL — auto-allowed by project hook'
          : 'SQL may write or alter state — approval required',
      },
    })
  );
});
