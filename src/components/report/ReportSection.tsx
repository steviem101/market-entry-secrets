import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportSectionProps {
  id: string;
  title: string;
  content: string;
  children?: React.ReactNode;
}

export const ReportSection = ({ id, title, content, children }: ReportSectionProps) => {
  return (
    <section id={id} className="scroll-mt-20">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
            {content}
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
};
