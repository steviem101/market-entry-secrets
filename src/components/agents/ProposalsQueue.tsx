import { useMemo, useState } from "react";
import { Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAgentProposals, useAgentProposalActions, type AgentProposal } from "@/hooks/useAgentProposals";
import { MAX_BULK, type AgentActionResponse } from "@/lib/api/agentApi";
import {
  toggleKey, selectAll, allSelected, summariseSelection, partitionResults,
} from "@/lib/agentSelection";

const STATUS_OPTIONS = ["pending", "approved", "auto_approved", "applied", "apply_failed", "rejected"];
// The agent_proposals view's union sources (stable; new loops extend the view deliberately).
const SOURCE_OPTIONS = [
  "agent_content_proposals", "directory_steward_staging", "directory_discovery_staging",
  "directory_demand_signals", "report_quality_proposals", "prompt_ab_proposals",
  "ecosystem_import_candidates", "innovation_ecosystem_enrichment_staging",
  "trade_agencies_enrichment_staging",
];
const PAGE_SIZES = [25, 50, 100];

// trade_agencies_enrichment_staging.created_at is nullable (verified live), so the view can
// deliver a null here despite the hook's string type — an unguarded new Date(null) would make
// formatDistanceToNow throw and crash the queue.
const relativeTime = (iso: string | null | undefined): string => {
  if (!iso) return "unknown";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "unknown" : formatDistanceToNow(d, { addSuffix: true });
};

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "applied": return "default";
    case "apply_failed": return "destructive";
    case "pending": return "secondary";
    default: return "outline";
  }
};

type BulkAction = "approve" | "reject";

interface LastOutcome {
  action: string;
  ok: number;
  failed: Array<{ proposal_key: string; error?: string }>;
}

export const ProposalsQueue = ({ loopOptions }: { loopOptions: string[] }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState("pending");
  const [loop, setLoop] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  // Selection is cleared on any page/filter change so the confirm modal always summarises
  // exactly the rows the reviewer can currently see. What you approve is what you saw.
  const [selection, setSelection] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null);
  const [lastOutcome, setLastOutcome] = useState<LastOutcome | null>(null);

  const { data, isLoading, error, isPlaceholderData } = useAgentProposals({ status, loop, source, page, pageSize });
  const { approve, reject, retry } = useAgentProposalActions();
  // Freeze selection while keepPreviousData is showing the PREVIOUS page's rows: ticking a stale
  // row would let the confirm modal summarise against rows that are about to be replaced.
  const busy = approve.isPending || reject.isPending || retry.isPending;
  const selectionFrozen = busy || isPlaceholderData;

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const count = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const pageKeys = useMemo(() => rows.map((r) => r.proposal_key), [rows]);

  const resetTo = (fn: () => void) => { fn(); setPage(0); setSelection([]); setExpanded(null); };

  const runAction = async (action: "approve" | "reject" | "retry", keys: string[]) => {
    const mutation = action === "approve" ? approve : action === "reject" ? reject : retry;
    try {
      const res = (await mutation.mutateAsync(keys)) as AgentActionResponse;
      const { ok, failed } = partitionResults(res.results);
      setLastOutcome({ action, ok: ok.length, failed });
      setSelection([]);
      if (failed.length === 0) {
        toast({ title: `${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Retried"} ${ok.length} proposal${ok.length === 1 ? "" : "s"}` });
      } else {
        toast({
          title: `${ok.length} succeeded, ${failed.length} failed`,
          description: "The failed rows are listed below the queue.",
          variant: "destructive",
        });
      }
    } catch (e) {
      setLastOutcome({ action, ok: 0, failed: keys.map((k) => ({ proposal_key: k, error: e instanceof Error ? e.message : "request failed" })) });
      toast({ title: "Action failed", description: "Could not reach agent-actions. Try again.", variant: "destructive" });
    }
  };

  const bulkSummary = pendingBulk ? summariseSelection(rows, selection) : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => resetTo(() => setStatus(v))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={loop} onValueChange={(v) => resetTo(() => setLoop(v))}>
          <SelectTrigger className="w-[190px]"><SelectValue placeholder="Loop" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All loops</SelectItem>
            {loopOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(v) => resetTo(() => setSource(v))}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {SOURCE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(pageSize)} onValueChange={(v) => resetTo(() => setPageSize(Number(v)))}>
          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selection.length} selected (max {MAX_BULK})
        </span>
        <Button size="sm" disabled={selection.length === 0 || selectionFrozen} onClick={() => setPendingBulk("approve")}>
          Approve selected
        </Button>
        <Button size="sm" variant="destructive" disabled={selection.length === 0 || selectionFrozen} onClick={() => setPendingBulk("reject")}>
          Reject selected
        </Button>
        {selection.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setSelection([])}>Clear</Button>
        )}
      </div>

      {/* Result panel: a partial failure must stay visible, not vanish with a toast */}
      {lastOutcome && lastOutcome.failed.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>
            {lastOutcome.failed.length} of {lastOutcome.ok + lastOutcome.failed.length} rows failed to {lastOutcome.action}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-0.5 text-xs">
              {lastOutcome.failed.map((f) => (
                <li key={f.proposal_key} className="font-mono break-all">
                  {f.proposal_key}: {f.error ?? "unknown error"}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Queue */}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load proposals</AlertTitle>
          <AlertDescription>Check that you are signed in with an admin account, then refresh.</AlertDescription>
        </Alert>
      ) : isLoading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">No proposals match the current filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected(selection, pageKeys)}
                    disabled={selectionFrozen}
                    onCheckedChange={() => {
                      if (allSelected(selection, pageKeys)) {
                        setSelection(selection.filter((k) => !pageKeys.includes(k)));
                      } else {
                        const r = selectAll(selection, pageKeys, MAX_BULK);
                        setSelection(r.selection);
                        if (r.capped) toast({ title: `Selection capped at ${MAX_BULK}` });
                      }
                    }}
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
                <TableHead className="w-8" />
                <TableHead>Loop</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="min-w-[280px]">Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: AgentProposal) => (
                <Fragment key={row.proposal_key}>
                  <TableRow data-state={selection.includes(row.proposal_key) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selection.includes(row.proposal_key)}
                        disabled={selectionFrozen}
                        onCheckedChange={() => {
                          const r = toggleKey(selection, row.proposal_key, MAX_BULK);
                          setSelection(r.selection);
                          if (r.capped) toast({ title: `Selection capped at ${MAX_BULK}` });
                        }}
                        aria-label={`Select ${row.proposal_key}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        aria-label="Toggle payload"
                        onClick={() => setExpanded(expanded === row.proposal_key ? null : row.proposal_key)}
                      >
                        {expanded === row.proposal_key ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.loop_name}</TableCell>
                    <TableCell><code className="text-xs">{row.action_type}</code></TableCell>
                    <TableCell className="text-sm max-w-[420px] truncate" title={row.reason}>{row.reason}</TableCell>
                    <TableCell><Badge variant={statusVariant(row.status)}>{row.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {relativeTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {row.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="mr-1" disabled={busy}
                            onClick={() => runAction("approve", [row.proposal_key])}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" disabled={busy}
                            onClick={() => runAction("reject", [row.proposal_key])}>
                            Reject
                          </Button>
                        </>
                      )}
                      {row.status === "auto_approved" && (
                        <Button size="sm" variant="ghost" disabled={busy}
                          onClick={() => runAction("reject", [row.proposal_key])}>
                          Reject
                        </Button>
                      )}
                      {row.status === "apply_failed" && (
                        <Button size="sm" variant="outline" disabled={busy}
                          onClick={() => runAction("retry", [row.proposal_key])}>
                          Retry apply
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expanded === row.proposal_key && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/40">
                        <div className="text-xs space-y-1 py-1">
                          <p className="font-mono break-all text-muted-foreground">
                            {row.proposal_key}
                            {row.target_table ? ` · target ${row.target_table}${row.target_id ? ` / ${row.target_id}` : ""}` : ""}
                          </p>
                          <pre className="overflow-x-auto rounded bg-background p-2 border max-h-64">
                            {JSON.stringify(row.payload ?? {}, null, 2)}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{count} proposal{count === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 0 || isLoading}
            onClick={() => { setPage(page - 1); setSelection([]); setExpanded(null); }}>
            Previous
          </Button>
          <span>Page {page + 1} of {pageCount}</span>
          <Button size="sm" variant="outline" disabled={page + 1 >= pageCount || isLoading}
            onClick={() => { setPage(page + 1); setSelection([]); setExpanded(null); }}>
            Next
          </Button>
        </div>
      </div>

      {/* Bulk confirm */}
      <AlertDialog open={pendingBulk !== null} onOpenChange={(open) => { if (!open) setPendingBulk(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBulk === "approve" ? "Approve" : "Reject"} {bulkSummary?.total ?? 0} proposal{(bulkSummary?.total ?? 0) === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {pendingBulk === "approve" && (
                  <p>Approving applies whitelisted changes to production through apply-proposal.</p>
                )}
                <ul className="text-sm">
                  {(bulkSummary?.byActionType ?? []).map((t) => (
                    <li key={t.actionType}>
                      <code className="text-xs">{t.actionType}</code>: {t.count}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = pendingBulk;
                setPendingBulk(null);
                if (action) runAction(action, selection);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
