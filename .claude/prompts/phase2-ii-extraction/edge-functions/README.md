# Phase 2 — Irish Insights edge functions (captured from MES, deployed to II)

These two functions are part of the Irish Insights ingest pipeline. They were
**only ever deployed** on the MES project (`xhziwveaiuhzdoutpgrh`) — their
canonical source lives in the separate **`ii-ingest`** repo, not in this one.

Captured here verbatim during the Phase 2 extraction (2026-06-29) and redeployed
to the new **Irish Insights** project (`schyrnxekxcoaragofgv`, eu-west-1) via the
Supabase MCP `deploy_edge_function` tool. This folder is a **migration record /
backup** so the deployed bytes are version-controlled and recoverable; it is not
wired into this repo's `supabase/` build. Keep the authoritative copy in `ii-ingest`.

Both are deployed with **`verify_jwt = false`** — they authenticate in-code via a
shared-secret header (matching how they ran on MES). With secrets unset they fail
**closed** (`apify-webhook` → 401, `notion-research-trigger` → 500), so deploying
ahead of the consumer repoint is safe.

## New endpoints (Irish Insights)

| Function | URL |
|----------|-----|
| `apify-webhook` | `https://schyrnxekxcoaragofgv.supabase.co/functions/v1/apify-webhook` |
| `notion-research-trigger` | `https://schyrnxekxcoaragofgv.supabase.co/functions/v1/notion-research-trigger` |

## Required secrets (set on the Irish Insights project — values are NOT migrated by MCP)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase into
every function — do **not** set them manually.

### `apify-webhook`
| Secret | Purpose |
|--------|---------|
| `APIFY_WEBHOOK_SECRET` | Shared secret; must equal the `x-apify-webhook-secret` header the Apify webhook sends. Reuse the MES value so only the URL changes. |
| `APIFY_TOKEN` | Apify API token used to fetch the run's dataset. Same value as MES. |

### `notion-research-trigger`
| Secret | Purpose |
|--------|---------|
| `NOTION_TRIGGER_SECRET` | Shared secret; must equal the `x-notion-trigger-secret` header the Notion automation sends. Reuse the MES value. |
| `GITHUB_DISPATCH_TOKEN` | GitHub PAT (fine-grained, `actions:write`) for `workflow_dispatch`. |
| `GITHUB_REPO_OWNER` | Owner of the repo holding `research.yml`. |
| `GITHUB_REPO_NAME` | Repo name holding `research.yml`. |
| `GITHUB_REF` | _(optional, default `main`)_ Git ref to dispatch against. |
| `GITHUB_WORKFLOW_FILE` | _(optional, default `research.yml`)_ Workflow filename. |

## Consumer repoint (external; do at cutover)

- **Apify task `3RnAZzC9CsXXPZrbM`** → set its webhook URL to the new `apify-webhook` endpoint (keep the same `x-apify-webhook-secret`).
- **Notion automation** (Research Status → deep-research) → set its HTTP-request URL to the new `notion-research-trigger` endpoint (keep the same `x-notion-trigger-secret`).
- The Python classifier, Beehiiv, and `research.yml` read/write the **database**, not these functions — they repoint by switching to the Irish Insights connection string / keys (separate step).
