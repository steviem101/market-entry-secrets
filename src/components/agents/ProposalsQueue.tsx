import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import { ListPagination } from "@/components/common/ListPagination";
import { useToast } from "@/hooks/use-toast";
import { useAgentProposals, useAgentProposalActions, type AgentProposal } from "@/hooks/useAgentProposals";
import { MAX_BULK, type AgentActionResponse } from "@/lib/api/agentApi";
import { relativeTime } from "@/lib/relativeTime";
import {
  STATUS_OPTIONS, SOURCE_OPTIONS, LOOP_OPTIONS, isSelectable, rowActions, type RowAction,
} from "@/lib/agentProposalsMeta";
import {
  toggleKey, selectAll, allSelected, summariseSelection, partitionResults,
  type SelectionSummary,
} from "@/lib/agentSelection";

const PAGE_SIZES = [25, 50, 100];

// PROPOSAL-status mapping (canonical agent_proposals vocabulary). Deliberately named apart from
// the grid's runStatusVariant: different vocabularies, do not "deduplicate".
const proposalStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "applied": return "default";
    case "apply_failed": return "destructive";
    case "pending": return "secondary";
    default: return "outline";
  }
};

const ACTION_LABELS: Record<RowAction, { label: string; variant: "outline" | "ghost" }> = {
  approve: { label: "Approve", variant: "outline" },
  retry: { label: "Retry apply", variant: "outline" },
  reject: { label: "Reject", variant: "ghost" },
};

interface BulkSnapshot {
  action: "approve" | "reject";
  /** Frozen at modal open: exactly these keys are sent on Confirm, no more, no fewer. */
  keys: string[];
  summary: SelectionSummary;
}

interface LastOutcome {
  action: string;
  ok: number;
  failed: Array<{ proposal_key: string; error?: string }>;
}

export const ProposalsQueue = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState("pending");
  const [loop, setLoop] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  // Selection is cleared on any page/filter change, and the confirm modal operates on a frozen
  // snapshot of selection ∩ visible rows: what you approve is exactly what you saw.
  const [selection, setSelection] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingBulk, setPendingBulk] = useState<BulkSnapshot | null>(null);
  const [lastOutcome, setLastOutcome] = useState<LastOutcome | null>(null);
  // Synchronous double-fire guard: React Query's isPending only disables buttons on the NEXT
  // render, so a fast double-click would run the action twice without this.
  const inflight = useRef(false);

  const { data, isLoading, error, isPlaceholderData } = useAgentProposals({ status, loop, source, page, pageSize });
  const { approve, reject, retry } = useAgentProposalActions();
  const busy = approve.isPending || reject.isPending || retry.isPending;
  const selectionFrozen = busy || isPlaceholderData;

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const count = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const selectedSet = useMemo(() => new Set(selection), [selection]);
  // Only actionable rows are selectable — the header select-all must never sweep applied or
  // rejected rows into a bulk approve (the server would re-approve and APPLY a rejected row).
  const selectableKeys = useMemo(
    () => rows.filter((r) => isSelectable(r.status)).map((r) => r.proposal_key),
    [rows],
  );

  const goToPage = (p: number) => { setPage(p); setSelection([]); setExpanded(null); };
  const resetTo = (fn: () => void) => { fn(); goToPage(0); };

  // Clamp when a mutation shrinks count below the current page (otherwise the refetch asks
  // PostgREST for an out-of-range window and the queue shows a misleading error).
  useEffect(() => {
    if (!isLoading && page > pageCount - 1) goToPage(pageCount - 1);
  }, [pageCount, page, isLoading]); // goToPage is render-scoped and stable in effect

  // Backstop for the 416/PGRST103 path (the failed response carries no fresh count to clamp on).
  useEffect(() => {
    if (error && page > 0) goToPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const runAction = async (action: "approve" | "reject" | "retry", keys: string[]) => {
    if (inflight.current || keys.length === 0) return;
    inflight.current = true;
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
      const message = e instanceof Error ? e.message : "The request failed.";
      setLastOutcome({ action, ok: 0, failed: keys.map((k) => ({ proposal_key: k, error: message })) });
      toast({ title: "Action failed", description: message, variant: "destructive" });
    } finally {
      inflight.current = false;
    }
  };

  const openBulk = (action: "approve" | "reject") => {
    // Snapshot selection ∩ currently visible rows: the modal summarises exactly what Confirm
    // will send, even if a background refetch replaces rows while the modal is open.
    const visible = new Set(rows.map((r) => r.proposal_key));
    const keys = selection.filter((k) => visible.has(k));
    if (keys.length === 0) {
      toast({ title: "Nothing to confirm", description: "The selected rows are no longer visible. Reselect and try again." });
      setSelection([]);
      return;
    }
    if (keys.length < selection.length) setSelection(keys);
    setPendingBulk({ action, keys, summary: summariseSelection(rows, keys) });
  };

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
            {LOOP_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
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
          {selection.length} selected (max {MAX_BULK}; only pending and auto approved rows are selectable)
        </span>
        <Button size="sm" disabled={selection.length === 0 || selectionFrozen} onClick={() => openBulk("approve")}>
          Approve selected
        </Button>
        <Button size="sm" variant="destructive" disabled={selection.length === 0 || selectionFrozen} onClick={() => openBulk("reject")}>
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
          <AlertDescription>{error instanceof Error ? error.message : "Refresh the page and try again."}</AlertDescription>
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
                    checked={allSelected(selection, selectableKeys)}
                    disabled={selectionFrozen || selectableKeys.length === 0}
                    onCheckedChange={() => {
                      if (allSelected(selection, selectableKeys)) {
                        setSelection(selection.filter((k) => !selectableKeys.includes(k)));
                      } else {
                        const r = selectAll(selection, selectableKeys, MAX_BULK);
                        setSelection(r.selection);
                        if (r.capped) toast({ title: `Selection capped at ${MAX_BULK}` });
                      }
                    }}
                    aria-label="Select all actionable rows on this page"
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
                  <TableRow data-state={selectedSet.has(row.proposal_key) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSet.has(row.proposal_key)}
                        disabled={selectionFrozen || !isSelectable(row.status)}
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
                    <TableCell><Badge variant={proposalStatusVariant(row.status)}>{row.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {relativeTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {rowActions(row.status, row.source_table).map((action) => (
                        <Button
                          key={action}
                          size="sm"
                          variant={ACTION_LABELS[action].variant}
                          className="ml-1"
                          disabled={busy}
                          onClick={() => runAction(action, [row.proposal_key])}
                        >
                          {action === "approve" && row.status === "auto_approved" ? "Apply now" : ACTION_LABELS[action].label}
                        </Button>
                      ))}
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
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-muted-foreground">{count} proposal{count === 1 ? "" : "s"}</span>
        <ListPagination
          currentPage={page + 1}
          totalPages={pageCount}
          onPageChange={(p) => goToPage(p - 1)}
          isLoading={isLoading}
        />
      </div>

      {/* Bulk confirm */}
      <AlertDialog open={pendingBulk !== null} onOpenChange={(open) => { if (!open) setPendingBulk(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBulk?.action === "approve" ? "Approve" : "Reject"} {pendingBulk?.summary.total ?? 0} proposal{(pendingBulk?.summary.total ?? 0) === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {pendingBulk?.action === "approve" && (
                  <p>Approving applies whitelisted changes to production through apply-proposal.</p>
                )}
                <ul className="text-sm">
                  {(pendingBulk?.summary.byActionType ?? []).map((t) => (
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
                const snapshot = pendingBulk;
                setPendingBulk(null);
                if (snapshot) runAction(snapshot.action, snapshot.keys);
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
