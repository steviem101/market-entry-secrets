import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminSubmissions, Submission } from "@/hooks/useAdminSubmissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

const SUBMISSION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "mentor", label: "Mentor" },
  { value: "service_provider", label: "Service Provider" },
  { value: "trade_agency", label: "Trade Agency" },
  { value: "innovation_organization", label: "Innovation Org" },
  { value: "investor", label: "Investor" },
  { value: "event", label: "Event" },
  { value: "content", label: "Content" },
  { value: "case_study", label: "Case Study" },
  { value: "guide", label: "Guide" },
  { value: "data_request", label: "Data Request" },
  { value: "mentor_contact", label: "Mentor Contact" },
  { value: "contact_inquiry", label: "Contact Inquiry" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
    case "in_review":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const typeLabel = (type: string) =>
  SUBMISSION_TYPES.find((t) => t.value === type)?.label || type;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminSubmissions = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { submissions, loading, refetch, updateStatus } = useAdminSubmissions({
    typeFilter,
    statusFilter,
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatus(id, newStatus, reviewNotes || undefined);
    setReviewNotes("");
  };

  const formDataEntries = (data: Record<string, unknown>) => {
    const skip = new Set(["submission_version", "content_type"]);
    return Object.entries(data).filter(
      ([key, val]) => !skip.has(key) && val !== "" && val !== null && val !== undefined
    );
  };

  return (
    <ProtectedRoute requireAdmin>
      <Helmet>
        <title>Admin - Submissions | Market Entry Secrets</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
            <p className="text-gray-600 mt-1">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBMISSION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Loading submissions...
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(sub.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {typeLabel(sub.submission_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sub.contact_email}</TableCell>
                    <TableCell className="text-sm">
                      {(sub.form_data as any)?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(sub.status)}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {sub.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(sub.id, "in_review")}
                              title="Mark as In Review"
                            >
                              <Clock className="w-4 h-4 text-yellow-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(sub.id, "approved")}
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(sub.id, "rejected")}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {sub.status === "in_review" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(sub.id, "approved")}
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(sub.id, "rejected")}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Modal */}
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {typeLabel(selectedSubmission.submission_type)}
                    </Badge>
                    <Badge variant={statusBadgeVariant(selectedSubmission.status)}>
                      {selectedSubmission.status}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Submitted</span>
                      <p>{formatDate(selectedSubmission.created_at)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Email</span>
                      <p>{selectedSubmission.contact_email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Form Data</h3>
                    <div className="space-y-2">
                      {formDataEntries(selectedSubmission.form_data).map(
                        ([key, val]) => (
                          <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                            <span className="font-medium text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                            </span>
                            <span className="col-span-2 text-gray-900 whitespace-pre-wrap">
                              {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {selectedSubmission.review_notes && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Review Notes
                      </h3>
                      <p className="text-sm text-gray-700">
                        {selectedSubmission.review_notes}
                      </p>
                    </div>
                  )}

                  {selectedSubmission.status !== "approved" &&
                    selectedSubmission.status !== "rejected" && (
                      <div className="border-t pt-4 space-y-3">
                        <Label htmlFor="review-notes">Review Notes</Label>
                        <Textarea
                          id="review-notes"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes about this submission..."
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={async () => {
                              await handleStatusChange(
                                selectedSubmission.id,
                                "in_review"
                              );
                              setSelectedSubmission(null);
                            }}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            In Review
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              await handleStatusChange(
                                selectedSubmission.id,
                                "rejected"
                              );
                              setSelectedSubmission(null);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={async () => {
                              await handleStatusChange(
                                selectedSubmission.id,
                                "approved"
                              );
                              setSelectedSubmission(null);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSubmissions;
