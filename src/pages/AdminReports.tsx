import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { RefreshCw, Search, ExternalLink } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAllReportsAdmin } from "@/hooks/useReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusBadgeVariant = (status: string) => {
  if (status === "completed") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
};

/** Colour a 0–100 quality score: green ≥85, amber ≥70, red below. Null → dash. */
const ScoreCell = ({ value }: { value: number | null | undefined }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  const tone =
    value >= 85
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= 70
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
  return <span className={`font-medium tabular-nums ${tone}`}>{value}</span>;
};

const AdminReports = () => {
  const { data: reports, isLoading, isFetching, refetch } = useAllReportsAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (reports ?? []).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        r.user_intake_forms?.company_name,
        r.user_intake_forms?.country_of_origin,
        r.user_intake_forms?.industry_sector,
        r.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reports, search, statusFilter]);

  return (
    <ProtectedRoute requireAdmin>
      <Helmet>
        <title>Admin - Reports | Market Entry Secrets</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading
                ? "Loading…"
                : `${filtered.length} of ${reports?.length ?? 0} report${
                    (reports?.length ?? 0) !== 1 ? "s" : ""
                  }`}
              {" — review any customer's report and its quality scores"}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search company, country, sector, or report id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Origin / sector</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" title="report_quality.report_score">
                  Report
                </TableHead>
                <TableHead className="text-right" title="report_quality.build_health">
                  Build
                </TableHead>
                <TableHead className="text-right" title="report_quality.score_substance">
                  Substance
                </TableHead>
                <TableHead className="text-right" title="report_quality.score_presentation">
                  Present.
                </TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    Loading reports…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {r.user_intake_forms?.company_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[r.user_intake_forms?.country_of_origin, r.user_intake_forms?.industry_sector]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {r.tier_at_generation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={statusBadgeVariant(r.status)} className="capitalize">
                          {r.status}
                        </Badge>
                        {r.quality?.degraded && (
                          <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/40">
                            degraded
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell value={r.quality?.report_score} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell value={r.quality?.build_health} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell value={r.quality?.score_substance} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell value={r.quality?.score_presentation} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/reports/${r.id}`} title="Open full report">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Showing up to 500 most recent reports. Scores come from the report-quality
          telemetry (the same numbers posted to #report-quality in Slack); a dash means no
          quality run has been recorded for that report yet.
        </p>
      </div>
    </ProtectedRoute>
  );
};

export default AdminReports;
