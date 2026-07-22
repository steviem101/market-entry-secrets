import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoopActivityPoint } from "@/lib/agentLoopHealth";

/**
 * 30-day activity: proposals created vs resolved per loop, acceptance rate in the tooltip.
 * Horizontal bars so long loop names stay readable at 390px.
 */
export const ActivityChart = ({ activity, isLoading }: { activity: LoopActivityPoint[] | undefined; isLoading: boolean }) => {
  if (isLoading) return <Skeleton className="h-64 rounded-lg" />;
  if (!activity || activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No proposals created in the last 30 days.</p>;
  }
  const data = activity.map((a) => ({
    name: a.loop_name,
    proposed: a.proposed,
    resolved: a.resolved,
    acceptance: Math.round(a.acceptance_rate * 100),
  }));
  const height = Math.max(160, data.length * 56);
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis type="category" dataKey="name" width={150} stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            // No value formatter: recharts already labels each entry with the Bar's `name` prop.
            // (A formatter comparing against the dataKey received the NAME and mislabelled both
            // series as "Resolved" — caught in review.)
            labelFormatter={(label: string) => {
              const row = data.find((d) => d.name === label);
              return row ? `${label} (acceptance ${row.acceptance}%)` : label;
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Bar dataKey="proposed" name="Proposed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
