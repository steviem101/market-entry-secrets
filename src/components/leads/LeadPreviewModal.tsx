import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMockPreviewData, type MockPreviewRow } from "@/constants/mockPreviewData";
import { useLeadDatabaseRecords } from "@/hooks/useLeadDatabases";
import type { LeadDatabase, LeadDatabaseRecord } from "@/types/leadDatabase";

interface LeadPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDatabase;
  onCheckout: () => void;
}

/**
 * Masks a full name to show only first name + last initial.
 * "John Smith" → "John S."
 */
const maskName = (name: string | null): string => {
  if (!name) return '••••••';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

/**
 * Masks an email to show first letter + domain hint.
 * "john@company.com.au" → "j••••@••••••••.com.au"
 */
const maskEmail = (email: string | null): string => {
  if (!email) return '••••@••••••.com.au';
  const [local, domain] = email.split('@');
  if (!domain) return `${local[0]}••••@••••••.com.au`;
  return `${local[0]}••••@${'•'.repeat(Math.min(domain.length, 8))}.com.au`;
};

/**
 * Converts real preview records into display rows with masked sensitive fields.
 */
const recordsToRows = (records: LeadDatabaseRecord[]): MockPreviewRow[] => {
  return records.map((r) => ({
    company: r.company_name || '••••••',
    contact: maskName(r.contact_name),
    title: r.job_title || '••••••',
    email: maskEmail(r.email),
    location: r.city || r.state || r.location || '••••••',
  }));
};

export const LeadPreviewModal = ({
  open,
  onOpenChange,
  lead,
  onCheckout,
}: LeadPreviewModalProps) => {
  const { data: previewRecords = [] } = useLeadDatabaseRecords(
    open ? lead.id : ''
  );

  const hasRealData = previewRecords.length > 0;
  const rows: MockPreviewRow[] = hasRealData
    ? recordsToRows(previewRecords)
    : getMockPreviewData(lead.sector);

  // TODO: Replace mock data with real preview records from lead_database_records table
  // Once all lead databases have preview records populated, the mock fallback can be removed.

  const ctaLabel = lead.is_free
    ? 'Get Free Access'
    : lead.price_aud
      ? `Get Instant Access — $${lead.price_aud.toLocaleString()} AUD`
      : 'Get Instant Access';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Preview: {lead.title}
          </DialogTitle>
          <div className="flex items-center gap-2 pt-1">
            {lead.record_count && (
              <Badge variant="secondary" className="text-xs">
                {lead.record_count.toLocaleString()} records
              </Badge>
            )}
            {lead.sector && (
              <Badge variant="outline" className="text-xs">
                {lead.sector}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Preview Table */}
        <div className="mt-4 overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Company</th>
                <th className="text-left p-3 font-medium">Contact</th>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t ${i >= 3 ? 'blur-[3px] select-none' : ''}`}
                >
                  <td className="p-3">{row.company}</td>
                  <td className="p-3">{row.contact}</td>
                  <td className="p-3">{row.title}</td>
                  <td className="p-3 font-mono text-xs">{row.email}</td>
                  <td className="p-3">{row.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lock overlay message */}
        <div className="flex flex-col items-center text-center py-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Sign in or purchase to unlock full access to{' '}
              {lead.record_count?.toLocaleString() || 'all'} records
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Every record includes verified contact details, company data, and enrichment signals
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified data
            </span>
            <span>•</span>
            <span>Instant delivery</span>
            <span>•</span>
            <span>CSV + API access</span>
          </div>
          <Button size="lg" onClick={onCheckout} className="mt-2">
            {ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
