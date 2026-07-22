import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAgentLoopHealth } from "@/hooks/useAgentRuns";
import { LoopHealthGrid } from "@/components/agents/LoopHealthGrid";
import { ActivityChart } from "@/components/agents/ActivityChart";
import { ProposalsQueue } from "@/components/agents/ProposalsQueue";

/**
 * /admin/agents — the agent-loops review dashboard (MES-206). Shows what every loop has been
 * doing (automation_runs) and the unified proposals queue (agent_proposals view) with bulk
 * approve/reject. The backstop for missed Slack notifications: state lives only in the proposal
 * tables, so a decision made here or in Slack lands in the same place.
 */
const AdminAgents = () => {
  const { data, isLoading, error } = useAgentLoopHealth();

  return (
    <ProtectedRoute requireAdmin fallbackMessage="Admin access is required to review agent activity.">
      <Helmet>
        <title>Agent Loops | Admin | Market Entry Secrets</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Agent loops</h1>
          <p className="text-sm text-muted-foreground">
            Every automated loop proposes changes here for review. Nothing touches production until
            a proposal is approved and applied.
          </p>
        </header>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load loop health</AlertTitle>
            <AlertDescription>Refresh the page. If it persists, check the agent_proposals view and automation_runs table.</AlertDescription>
          </Alert>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Loop health (last 30 days)</h2>
              <LoopHealthGrid health={data?.health} isLoading={isLoading} />
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Activity</h2>
              <ActivityChart activity={data?.activity} isLoading={isLoading} />
            </section>
          </>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Proposals</h2>
          <ProposalsQueue />
        </section>
      </div>
    </ProtectedRoute>
  );
};

export default AdminAgents;
