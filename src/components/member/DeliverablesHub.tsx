import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight } from 'lucide-react';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useMyLeadListRequests } from '@/hooks/useLeadListRequests';
import { buildDeliverables, type DeliverableStatus } from '@/lib/deliverables';

// Status → label + token-based badge classes (no hardcoded palette).
const STATUS_META: Record<DeliverableStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'border-primary/30 bg-primary/10 text-primary' },
  in_progress: { label: 'In progress', className: 'border-primary/20 bg-primary/5 text-primary' },
  delivered: { label: 'Delivered', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  used: { label: 'Used', className: 'border-border bg-muted text-muted-foreground' },
  expired: { label: 'Expired', className: 'border-border bg-muted text-muted-foreground' },
  declined: { label: 'Declined', className: 'border-border bg-muted text-muted-foreground' },
};

/**
 * T15 (MES-188) — Deliverables & introductions hub. One member-facing view of
 * the concierge credits (service_entitlements: intros/calls) + custom lead-list
 * requests, with normalised statuses. Read-only over already-owner-scoped
 * tables. Flag-gated by the caller (`deliverables_hub`); renders nothing when
 * the member has no deliverables.
 */
export const DeliverablesHub = () => {
  const { entitlements } = useServiceEntitlements();
  const { data: leadRequests = [] } = useMyLeadListRequests();

  const items = useMemo(
    () => buildDeliverables(entitlements, leadRequests, Date.now()),
    [entitlements, leadRequests],
  );

  if (items.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Deliverables &amp; introductions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const meta = STATUS_META[item.status];
            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
                </div>
                {item.reportId && (
                  <Link
                    to={`/report/${item.reportId}`}
                    className="hidden items-center gap-1 text-xs text-primary hover:underline sm:inline-flex"
                  >
                    View report <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
                <Badge variant="outline" className={`shrink-0 ${meta.className}`}>{meta.label}</Badge>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Intros are made in good faith within our SLA — we&rsquo;ll email you as each is actioned.
        </p>
      </CardContent>
    </Card>
  );
};
