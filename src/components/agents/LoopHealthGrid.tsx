import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoopHealth } from "@/lib/agentLoopHealth";

const statusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "success": return "default";
    case "failed":
    case "error": return "destructive";
    case "running": return "secondary";
    default: return "outline";
  }
};

/**
 * One card per loop: last run, status, consecutive-success streak, and the pending-review count.
 * Loops with pending proposals sort first (the hook already orders them that way).
 */
export const LoopHealthGrid = ({ health, isLoading }: { health: LoopHealth[] | undefined; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
    );
  }
  if (!health || health.length === 0) {
    return <p className="text-sm text-muted-foreground">No loop activity recorded in the last 30 days.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {health.map((loop) => (
        <Card key={loop.loop_name}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base truncate">{loop.loop_name}</CardTitle>
              <Badge variant={statusVariant(loop.last_status)}>{loop.last_status ?? "no runs"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              Last run:{" "}
              {loop.last_run_at
                ? formatDistanceToNow(new Date(loop.last_run_at), { addSuffix: true })
                : "never (proposals only)"}
            </p>
            <p>Success streak: {loop.success_streak}</p>
            <p className="flex items-center gap-2">
              Pending review:
              {loop.pending_count > 0
                ? <Badge variant="secondary">{loop.pending_count}</Badge>
                : <span>0</span>}
              <span className="text-xs">({loop.proposals_total} total in 30 days)</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
