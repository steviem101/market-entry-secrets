import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sliders, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateReportSectionFeedback } from '@/hooks/useReportSectionFeedback';

// Structured refinement reasons per matched section (charter T14). Kept short +
// action-oriented; free text captures the rest.
const REFINE_REASONS: Record<string, string[]> = {
  mentor_recommendations: [
    'Different expertise', 'Earlier-stage', 'Later-stage', 'Different sector', 'More options', 'Prefer a warm intro',
  ],
  investor_recommendations: [
    'Different stage', 'Different cheque size', 'Different sector', 'More options', 'Prefer a warm intro',
  ],
};

export const SECTION_REFINEMENT_SECTIONS = Object.keys(REFINE_REASONS);

interface Props {
  sectionKey: string;
  reportId?: string | null;
}

/**
 * T14 concierge refinement box on a matched section. Structured reasons + free
 * text → report_section_feedback (the one feedback path). Flag-gated by the
 * caller (`section_refinement`). print:hidden so it never lands in the PDF.
 */
export const ReportSectionRefinement = ({ sectionKey, reportId }: Props) => {
  const reasons = REFINE_REASONS[sectionKey] ?? [];
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const { mutate, isPending } = useCreateReportSectionFeedback();

  const toggle = (r: string) =>
    setSelected((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const submit = () => {
    mutate(
      { sectionKey, reasonTags: selected, note, reportId },
      {
        onSuccess: () => {
          setDone(true);
          toast({ title: 'Thanks — noted', description: "We'll use this to refine your matches." });
        },
        onError: (e: unknown) =>
          toast({
            title: "Couldn't send that",
            description: e instanceof Error ? e.message : 'Please try again.',
            variant: 'destructive',
          }),
      },
    );
  };

  if (done) {
    return (
      <Card className="mt-6 border-primary/20 bg-primary/5 print:hidden">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            Thanks — we&rsquo;ll use this to refine your matches and follow up if we build something for you.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canSubmit = (selected.length > 0 || note.trim().length > 0) && !isPending;

  return (
    <Card className="mt-6 border-border print:hidden">
      <CardContent className="py-4">
        <div className="flex items-start gap-2.5">
          <Sliders className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Not quite right? Refine these matches</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tell us what you&rsquo;d change and we&rsquo;ll tune them for you.
            </p>

            {reasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {reasons.map((r) => {
                  const on = selected.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(r)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        on
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            )}

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              placeholder="Anything specific? (optional)"
              className="mt-3 min-h-[64px] text-sm"
            />

            <div className="mt-3">
              <Button size="sm" onClick={submit} disabled={!canSubmit}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send refinement
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
