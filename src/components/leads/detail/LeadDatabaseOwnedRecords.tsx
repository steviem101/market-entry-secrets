/**
 * Full lead records for a buyer who owns the dataset (MES-198 / T7 D-B).
 *
 * Rendered on the lead-database detail page in place of the sales/preview flow
 * when useLeadDatabaseAccess() confirms the signed-in user holds a
 * lead_database_purchases entitlement (bought directly, or auto-delivered with a
 * Scale/Enterprise report — T7 PR-A). The buyer-scoped RLS is the real gate; this
 * component only asks for the full rows.
 */
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeadDatabaseRecords } from '@/hooks/useLeadDatabases';
import { recordsToCsv, csvFilename } from '@/lib/leadCsv';
import type { LeadDatabase } from '@/types/leadDatabase';

const dash = (v: unknown) => {
  if (v == null || v === '') return '—';
  return Array.isArray(v) ? (v.length ? v.join(', ') : '—') : String(v);
};

export const LeadDatabaseOwnedRecords = ({ db }: { db: LeadDatabase }) => {
  const { data: records = [], isLoading } = useLeadDatabaseRecords(db.id, { full: true });

  const handleExport = () => {
    const csv = recordsToCsv(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename(db.title);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">{db.title}</h1>
            <p className="text-sm text-muted-foreground">
              This list is included with your plan — here are the full records, yours to use.
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={isLoading || records.length === 0} className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : records.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Your records are being prepared. If they don&rsquo;t appear shortly, reply to your
          confirmation email and our team will sort it.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">{records.length.toLocaleString()} records</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Sector</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{dash(r.company_name)}</td>
                    <td className="px-3 py-2 text-foreground">{dash(r.contact_name)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{dash(r.job_title)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{dash(r.email)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{dash(r.city || r.state || r.location)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{dash(r.sector)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Export the CSV for every field, including phone, LinkedIn, website and buying signals.
          </p>
        </>
      )}
    </section>
  );
};
