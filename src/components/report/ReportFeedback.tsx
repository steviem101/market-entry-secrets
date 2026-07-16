import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react';
import { reportApi } from '@/lib/api/reportApi';
import { useToast } from '@/hooks/use-toast';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';

interface ReportFeedbackProps {
  reportId: string;
  existingScore?: number | null;
  /**
   * `standard` (default) is the full card with a notes box — the report footer
   * widget. `prominent` is a slim one-click bar shown at report open (T5a /
   * MES-191): quick thumbs, no textarea, collapses to a thank-you once voted.
   */
  variant?: 'standard' | 'prominent';
}

export const ReportFeedback = ({ reportId, existingScore, variant = 'standard' }: ReportFeedbackProps) => {
  const isProminent = variant === 'prominent';
  const [score, setScore] = useState<number | null>(existingScore ?? null);
  const [showNotes, setShowNotes] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingScore);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // T5a (MES-191): the first engagement with a feedback prompt. Fired once per
  // mount, tagged by placement so the top prompt and footer widget stay
  // separable in the funnel. Fire-and-forget, no PII.
  const openedRef = useRef(false);
  const trackOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    trackFunnelEvent('section_feedback_opened', {
      source: isProminent ? 'report_top' : 'report_footer',
    });
  };

  const handleVote = async (value: number) => {
    trackOpened();
    setScore(value);
    // The prominent bar is one-click: a vote submits immediately and collapses.
    // The standard card opens the notes box so the user can elaborate.
    if (isProminent) {
      setSubmitted(true);
      toast({ title: 'Thanks!', description: 'Your feedback helps us improve.' });
    } else {
      setShowNotes(true);
    }
    try {
      await reportApi.submitFeedback(reportId, value);
    } catch {
      // feedback submission failed silently
    }
  };

  const handleSubmitNotes = async () => {
    try {
      await reportApi.submitFeedback(reportId, score!, notes);
      setShowNotes(false);
      setSubmitted(true);
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
    } catch {
      // feedback submission failed silently
    }
  };

  if (submitted && !showNotes) {
    if (isProminent) {
      return (
        <div
          data-report-feedback
          className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        >
          <Check className="h-4 w-4 text-primary" />
          Thanks for your feedback!
        </div>
      );
    }
    return (
      <Card className="border-border/50 bg-muted/30" data-report-feedback>
        <CardContent className="p-6 text-center">
          <Check className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  // Prominent one-click bar (report open). Stacks vertically at 390px, inline
  // from sm up; the thumbs are always full-width tappable targets on mobile.
  if (isProminent) {
    return (
      <div
        data-report-feedback
        className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm font-medium text-foreground">Was this report useful?</p>
        <div className="flex gap-2">
          <Button
            variant={score === 1 ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-2 sm:flex-none"
            onClick={() => handleVote(1)}
          >
            <ThumbsUp className="h-4 w-4" />
            Yes
          </Button>
          <Button
            variant={score === -1 ? 'destructive' : 'outline'}
            size="sm"
            className="flex-1 gap-2 sm:flex-none"
            onClick={() => handleVote(-1)}
          >
            <ThumbsDown className="h-4 w-4" />
            No
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border/50" data-report-feedback>
      <CardContent className="p-6 text-center space-y-4">
        <p className="font-medium text-foreground">Was this report helpful?</p>
        <div className="flex justify-center gap-3">
          <Button
            variant={score === 1 ? 'default' : 'outline'}
            size="lg"
            className="gap-2"
            onClick={() => handleVote(1)}
          >
            <ThumbsUp className="w-5 h-5" />
            Yes
          </Button>
          <Button
            variant={score === -1 ? 'destructive' : 'outline'}
            size="lg"
            className="gap-2"
            onClick={() => handleVote(-1)}
          >
            <ThumbsDown className="w-5 h-5" />
            No
          </Button>
        </div>

        {showNotes && (
          <div className="space-y-3 pt-2 max-w-md mx-auto">
            <Textarea
              placeholder="Any feedback? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button onClick={handleSubmitNotes} className="gap-2">
              <Send className="w-4 h-4" />
              Submit Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
