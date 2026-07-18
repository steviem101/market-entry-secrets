# Exa MCP setup (web search for Claude Code sessions)

> Canonical upstream reference: https://docs.exa.ai/reference/exa-mcp
> (currently redirects to https://exa.ai/docs/reference/exa-mcp). If this runbook
> and the live docs disagree, the live docs win — update this file.

Exa MCP gives Claude Code real-time web search and page fetches. For MES we use it
for people + company research (mentors, service providers, investors, competitor
landscape) — Exa exposes general web search tools, not dedicated people/company
endpoints, so those use cases run through `web_search_exa` / `web_search_advanced_exa`
with targeted queries.

## Setup

Project scope (recommended — picked up automatically in this repo):

```bash
cp .mcp.json.example .mcp.json   # then remove any servers you don't use
```

`.mcp.json` is gitignored because it can contain credentials — never commit it.
The example config connects to `https://mcp.exa.ai/mcp` over HTTP transport with
the tool set we use: `web_search_exa`, `web_fetch_exa`, `web_search_advanced_exa`
(selected via the `?tools=` query parameter; Exa also offers `agent_tools` for
multi-step research, which we leave off by default).

Alternatively, user scope (applies across repos on your machine):

```bash
claude mcp add --transport http exa https://mcp.exa.ai/mcp
```

## Authentication

Two options:

1. **API key (recommended — avoids free-tier rate limits):** set `EXA_API_KEY` in
   your shell environment; the example config passes it as the `x-api-key` header.
   Get/manage keys at https://dashboard.exa.ai. Per the repo secrets policy
   (skill `secrets-and-env-management`): names in docs, values never in git.
2. **OAuth (no key):** delete the `headers` block from your local `.mcp.json`.
   On first connection Claude Code opens a browser to sign in to your Exa account.

## Troubleshooting

- Tools not appearing → restart Claude Code after changing `.mcp.json`.
- Rate-limited responses → set `EXA_API_KEY` (option 1 above).
- API status: https://status.exa.ai
