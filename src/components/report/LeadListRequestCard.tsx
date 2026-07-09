import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateLeadListRequest } from '@/hooks/useLeadListRequests';

interface LeadListRequestCardProps {
  reportId?: string | null;
  /** When true (used as the section empty-state), leads with a stronger prompt. */
  emptyState?: boolean;
}

// Custom lead-list request box (P1-D): when the ICP gate leaves few/no relevant
// lists, the member describes the list they need and we build it — delivered to
// their dashboard within 24 hours. print:hidden so it never lands in the PDF.
export const LeadListRequestCard = ({ reportId, emptyState }: LeadListRequestCardProps) => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const { mutate, isPending } = useCreateLeadListRequest();

  const submit = () => {
    mutate(
      { requestText: text, reportId },
      {
        onSuccess: () => {
          setDone(true);
          toast({ title: 'Request received', description: "We'll build your list and deliver it to your dashboard within 24 hours." });
        },
        onError: (e: unknown) => {
          toast({ title: "Couldn't send request", description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
        },
      },
    );
  };

  if (done) {
    return (
      <Card className="print:hidden border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Request received</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              We'll build your list and deliver it to your dashboard within 24 hours. You can track it under "Requested lists" on your member hub.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:hidden border-dashed border-border">
      <CardContent className="p-5 space-y-3">
        <div>
          <p className="font-semibold text-foreground">
            {emptyState ? "Need a specific list we don't have yet?" : 'Need a different lead list?'}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Describe the prospects you want — industry, role, region, company size — and we'll build the list and deliver it to your dashboard within 24 hours.
          </p>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Heads of Talent at Australian staffing agencies with 50–500 employees in NSW/VIC"
          className="min-h-[80px] text-sm"
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={isPending || !text.trim()} className="gap-1.5">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Request this list
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
