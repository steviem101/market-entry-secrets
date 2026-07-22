// agentApi — the client surface for the agent-loops dashboard. Every mutation goes through the
// agent-actions edge function (never a direct table write from the client), so the dashboard and
// the Slack buttons share one apply path and the client never needs write grants.

import { supabase } from "@/integrations/supabase/client";

export type AgentAction = "approve" | "reject" | "retry";

export interface AgentActionRowResult {
  proposal_key: string;
  ok: boolean;
  applied?: boolean;
  error?: string;
}

export interface AgentActionResponse {
  action: AgentAction;
  ok: number;
  total: number;
  results: AgentActionRowResult[];
}

// Mirror of the server bulk cap (agent-actions MAX_KEYS). The dashboard also caps selection at 100.
export const MAX_BULK = 100;

/**
 * supabase.functions.invoke wraps every non-2xx in a FunctionsHttpError whose .message is the
 * generic "Edge Function returned a non-2xx status code" — the real reason (401 admin required,
 * 400 too many keys) lives on error.context (the Response). Surface it, so an expired session
 * reads as "sign in again", not as a connectivity problem to retry.
 */
async function describeInvokeError(error: unknown): Promise<Error> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.status === "number") {
    let detail = "";
    try {
      const body = await ctx.json();
      detail = typeof body?.error === "string" ? body.error : "";
    } catch { /* non-JSON body */ }
    if (ctx.status === 401 || ctx.status === 403) {
      return new Error(`Not authorised (${ctx.status})${detail ? `: ${detail}` : ""}. Sign in again with an admin account.`);
    }
    return new Error(`agent-actions returned ${ctx.status}${detail ? `: ${detail}` : ""}`);
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function invokeAgentAction(action: AgentAction, proposalKeys: string[]): Promise<AgentActionResponse> {
  if (proposalKeys.length === 0) {
    return { action, ok: 0, total: 0, results: [] };
  }
  if (proposalKeys.length > MAX_BULK) {
    throw new Error(`Cannot ${action} more than ${MAX_BULK} proposals at once (selected ${proposalKeys.length}).`);
  }
  const { data, error } = await supabase.functions.invoke("agent-actions", {
    body: { action, proposal_keys: proposalKeys },
  });
  if (error) throw await describeInvokeError(error);
  return data as AgentActionResponse;
}

export const approveProposals = (keys: string[]) => invokeAgentAction("approve", keys);
export const rejectProposals = (keys: string[]) => invokeAgentAction("reject", keys);
export const retryProposals = (keys: string[]) => invokeAgentAction("retry", keys);

export const approveProposal = (key: string) => approveProposals([key]);
export const rejectProposal = (key: string) => rejectProposals([key]);
export const retryProposal = (key: string) => retryProposals([key]);
