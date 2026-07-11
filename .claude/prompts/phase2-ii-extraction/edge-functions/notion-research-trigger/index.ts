// Notion research trigger.
//
// Receives a webhook from a Notion database automation when a row's
// Research Status flips to deep-research. Verifies a shared secret in
// the X-Notion-Trigger-Secret header, then POSTs to the GitHub
// workflow_dispatch endpoint for research.yml so the orchestrator runs
// in real time instead of waiting for the daily cron.
//
// Body shape (set this in the Notion automation's HTTP body template):
//   {
//     "page_id": "<the Notion page id>"
//   }
//
// The orchestrator derives which source DB the row belongs to from the
// page's parent, so the same automation body works for both Email and
// LinkedIn DBs. The static bearer secret pattern matches apify-webhook.
// Notion integration webhooks (with HMAC signing) are a separate
// product; this receiver targets the database-automation HTTP-request
// action.

interface NotionTriggerPayload {
  // Direct callers (the `ii-ingest research trigger-test` CLI) put the
  // page id at the top level.
  page_id?: string;
  // Notion's "Send webhook" automation wraps the page in a `data` object
  // with the page id at body.data.id. Both shapes are accepted so the
  // same function works for direct calls and real Notion triggers.
  data?: {
    id?: string;
  };
}

interface DispatchResult {
  ok: boolean;
  status: number;
  detail: string;
}

interface TriggerConfig {
  secret: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubRef: string;
  workflowFile: string;
}

export type Fetcher = typeof fetch;

// Constant-time string compare. The `!==` short-circuit on a 32-byte
// random secret leaks little in practice but Edge Function endpoints
// have predictable cold-path latency, so use the XOR loop instead.
// Length divergence still leaks one bit (length); the standard tradeoff.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function loadConfig(): TriggerConfig {
  return {
    secret: Deno.env.get("NOTION_TRIGGER_SECRET") ?? "",
    githubToken: Deno.env.get("GITHUB_DISPATCH_TOKEN") ?? "",
    githubOwner: Deno.env.get("GITHUB_REPO_OWNER") ?? "",
    githubRepo: Deno.env.get("GITHUB_REPO_NAME") ?? "",
    githubRef: Deno.env.get("GITHUB_REF") ?? "main",
    workflowFile: Deno.env.get("GITHUB_WORKFLOW_FILE") ?? "research.yml",
  };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function dispatchWorkflow(
  cfg: TriggerConfig,
  pageId: string,
  fetcher: Fetcher = fetch,
): Promise<DispatchResult> {
  const url =
    `https://api.github.com/repos/${cfg.githubOwner}/${cfg.githubRepo}/actions/workflows/${cfg.workflowFile}/dispatches`;
  const res = await fetcher(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ii-notion-research-trigger",
    },
    body: JSON.stringify({
      ref: cfg.githubRef,
      inputs: { page_id: pageId },
    }),
  });
  // GitHub returns 204 No Content on a successful dispatch. Anything else
  // is an error worth surfacing back to the caller (and Notion's automation
  // log) so a misconfigured token or wrong workflow file does not silently
  // drop the trigger.
  let detail = "";
  if (!res.ok) {
    try {
      detail = await res.text();
    } catch {
      detail = "<unreadable response body>";
    }
  }
  return { ok: res.ok, status: res.status, detail };
}

export async function handleRequest(
  req: Request,
  cfg: TriggerConfig = loadConfig(),
  fetcher: Fetcher = fetch,
): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method not allowed" });
  }

  // A missing server-side secret is a misconfigured deploy, not an
  // authentication failure; return 500 so the operator notices instead
  // of seeing every request bounce as 401.
  if (!cfg.secret) {
    console.error("notion trigger secret env not configured");
    return jsonResponse(500, { error: "server not configured" });
  }
  const provided = req.headers.get("x-notion-trigger-secret") ?? "";
  if (!timingSafeEqual(provided, cfg.secret)) {
    return jsonResponse(401, { error: "invalid trigger secret" });
  }

  if (!cfg.githubToken || !cfg.githubOwner || !cfg.githubRepo) {
    console.error("github dispatch env not configured");
    return jsonResponse(500, { error: "server not configured" });
  }

  let payload: NotionTriggerPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid json" });
  }

  const pageId = (payload.page_id ?? payload.data?.id ?? "").trim();
  if (!pageId) {
    // Log top-level keys (not values) so a future shape change can be
    // diagnosed from function logs without leaking Notion page content.
    const topKeys = payload && typeof payload === "object"
      ? Object.keys(payload as Record<string, unknown>).join(",")
      : typeof payload;
    console.error("missing page_id; payload keys:", topKeys);
    return jsonResponse(400, { error: "missing page_id" });
  }

  let result: DispatchResult;
  try {
    result = await dispatchWorkflow(cfg, pageId, fetcher);
  } catch (e) {
    console.error("github dispatch fetch failed", e);
    return jsonResponse(502, {
      error: "github dispatch fetch failed",
      detail: String(e),
    });
  }

  if (!result.ok) {
    console.error(
      "github dispatch returned error",
      result.status,
      result.detail,
    );
    return jsonResponse(502, {
      error: "github dispatch returned error",
      status: result.status,
      detail: result.detail.slice(0, 500),
    });
  }

  console.log("dispatch ok", {
    page_id: pageId,
    status: result.status,
  });
  return jsonResponse(200, {
    ok: true,
    page_id: pageId,
    workflow: cfg.workflowFile,
    ref: cfg.githubRef,
    github_status: result.status,
  });
}

// Skip Deno.serve registration when imported by the test runner so the
// function file is unit-testable without binding a port.
if (import.meta.main) {
  Deno.serve((req) => handleRequest(req));
}
