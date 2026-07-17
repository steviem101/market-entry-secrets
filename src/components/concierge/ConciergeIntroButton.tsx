import { useState } from 'react';
import { Handshake, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useAuth } from '@/hooks/useAuth';
import { introKindForEntity } from '@/lib/conciergeIntros';
import { useConciergeIntroAvailability, useRequestConciergeIntro } from '@/hooks/useConciergeIntros';

interface ConciergeIntroButtonProps {
  entityType: 'mentor' | 'ecosystem';
  entityId: string;
  entityName: string;
  reportId?: string | null;
}

/**
 * T9 (MES-188) — concierge intro request action. Shown to a paid member who holds
 * a mentor/ecosystem intro allowance: requests a human-facilitated intro to this
 * entity, drawn from their D4 allowance (server-enforced). Flag-gated
 * (`concierge_intros`) and self-gating — renders nothing when the flag is off, the
 * member has no allowance of this kind, and no existing request for this entity.
 * Complements (does not replace) the anonymous "warm intro" funnel.
 */
export const ConciergeIntroButton = ({
  entityType, entityId, entityName, reportId = null,
}: ConciergeIntroButtonProps) => {
  const { user } = useAuth();
  const { requests, canRequest, availableFor } = useConciergeIntroAvailability();
  const request = useRequestConciergeIntro();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  // Hooks above always run; gate on render only (no conditional hooks).
  if (!isFeatureEnabled('concierge_intros') || !user) return null;

  const kind = introKindForEntity(entityType);
  const existing = requests.find(
    (r) => r.target_entity_id === entityId && r.status !== 'declined',
  );
  const remaining = availableFor(kind);

  // Already requested this entity → show status, no duplicate ask.
  if (existing) {
    const delivered = existing.status === 'delivered';
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        {delivered
          ? 'Introduction made — check your email.'
          : 'Introduction requested — we’re facilitating it.'}
      </p>
    );
  }

  // No allowance of this kind → nothing to offer here.
  if (!canRequest(kind)) return null;

  const submit = async () => {
    try {
      await request.mutateAsync({
        introKind: kind,
        targetEntityType: entityType,
        targetEntityId: entityId,
        requestText: note,
        reportId,
      });
      toast({ title: 'Introduction requested', description: `We’ll facilitate your intro to ${entityName}.` });
      setOpen(false);
      setNote('');
    } catch (e) {
      toast({
        title: 'Could not submit request',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button variant="secondary" className="mt-3 w-full" onClick={() => setOpen(true)}>
        <Handshake className="mr-2 h-4 w-4" />
        Request a concierge intro
        <span className="ml-1 text-xs opacity-80">({remaining} left)</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request an introduction to {entityName}</DialogTitle>
            <DialogDescription>
              We’ll personally facilitate the connection, drawn from your plan’s intro allowance
              ({remaining} remaining). Add anything that helps us make it land.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: what you’d like to explore, and why now."
            rows={4}
            maxLength={2000}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={request.isPending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={request.isPending}>
              {request.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request introduction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
