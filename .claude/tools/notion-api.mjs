#!/usr/bin/env node
// Direct Notion REST client for epic sessions (bypasses the claude.ai Notion
// connector, whose WRITE tools always show an approval dialog on the web
// surface — verified 2026-07-15, MES-188). Reads NOTION_API_KEY from the
// environment (set it in the Claude Code environment settings — never in git).
// The same internal integration the report-quality loop uses works, provided
// it is shared with the MES Tickets database.
//
// Usage:
//   node .claude/tools/notion-api.mjs comment <page_id> <text...>
//   node .claude/tools/notion-api.mjs append <page_id> <text...>   (paragraphs split on \n\n; lines starting with #/##/### become headings)
//   node .claude/tools/notion-api.mjs update-props <page_id> <json>  (Notion API properties object)
//   node .claude/tools/notion-api.mjs create-page <database_id> <json-props> [text...]
//   node .claude/tools/notion-api.mjs get <page_id>
//
// All output is JSON on stdout; non-zero exit + stderr message on failure.

const KEY = process.env.NOTION_API_KEY;
const VERSION = '2022-06-28';

async function call(method, path, body) {
  if (!KEY) {
    console.error('NOTION_API_KEY is not set in this environment. Add it in the Claude Code environment settings (Notion internal integration token shared with the MES Tickets DB).');
    process.exit(2);
  }
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Notion API ${res.status}: ${json.message || res.statusText}`);
    process.exit(1);
  }
  return json;
}

function rich(text) {
  // Notion caps a rich_text item at 2000 chars.
  const parts = [];
  for (let i = 0; i < text.length; i += 2000) parts.push({ type: 'text', text: { content: text.slice(i, i + 2000) } });
  return parts.length ? parts : [{ type: 'text', text: { content: '' } }];
}

function textToBlocks(text) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(#{1,3})\s+(.*)$/s);
      if (m) {
        const level = m[1].length;
        return { object: 'block', type: `heading_${level}`, [`heading_${level}`]: { rich_text: rich(m[2]) } };
      }
      return { object: 'block', type: 'paragraph', paragraph: { rich_text: rich(p) } };
    });
}

const [, , cmd, id, ...rest] = process.argv;
const text = rest.join(' ');

const run = {
  async comment() {
    return call('POST', 'comments', { parent: { page_id: id }, rich_text: rich(text) });
  },
  async append() {
    return call('PATCH', `blocks/${id}/children`, { children: textToBlocks(text) });
  },
  async 'update-props'() {
    return call('PATCH', `pages/${id}`, { properties: JSON.parse(text) });
  },
  async 'create-page'() {
    const props = JSON.parse(rest[0]);
    const bodyText = rest.slice(1).join(' ');
    const payload = { parent: { database_id: id }, properties: props };
    if (bodyText.trim()) payload.children = textToBlocks(bodyText);
    return call('POST', 'pages', payload);
  },
  async get() {
    return call('GET', `pages/${id}`);
  },
}[cmd];

if (!run || !id) {
  console.error('Usage: notion-api.mjs <comment|append|update-props|create-page|get> <id> [args...]');
  process.exit(2);
}
run().then((r) => console.log(JSON.stringify({ ok: true, id: r.id ?? null, object: r.object ?? null })));
