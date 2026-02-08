import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface ReportSectionProps {
  id: string;
  title: string;
  content: string;
  children?: React.ReactNode;
}

export const ReportSection = ({ id, title, content, children }: ReportSectionProps) => {
  return (
    <section id={id} className="scroll-mt-20" data-report-section>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pt-6 px-6 pb-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-5">
          <div className="prose max-w-none text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/90 prose-p:mb-4 prose-headings:mt-8 prose-headings:mb-3 prose-li:my-1 leading-relaxed report-prose">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
};
