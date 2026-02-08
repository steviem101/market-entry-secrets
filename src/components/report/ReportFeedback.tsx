import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react';
import { reportApi } from '@/lib/api/reportApi';
import { useToast } from '@/hooks/use-toast';

interface ReportFeedbackProps {
  reportId: string;
  existingScore?: number | null;
}

export const ReportFeedback = ({ reportId, existingScore }: ReportFeedbackProps) => {
  const [score, setScore] = useState<number | null>(existingScore ?? null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(!!existingScore);
  const { toast } = useToast();

  const handleVote = async (value: number) => {
    setScore(value);
    setShowNotes(true);
    try {
      await reportApi.submitFeedback(reportId, value);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const handleSubmitNotes = async () => {
    try {
      await reportApi.submitFeedback(reportId, score!, notes);
      setSubmitted(true);
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  if (submitted && !showNotes) {
    return (
      <Card className="border-border/50 bg-muted/30" data-report-feedback>
        <CardContent className="p-6 text-center">
          <Check className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
        </CardContent>
      </Card>
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
