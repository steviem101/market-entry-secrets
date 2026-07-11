import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CitationRenderer } from './CitationRenderer';
import { SECTION_CONFIG } from './reportSectionConfig';
import { Separator } from '@/components/ui/separator';

interface ReportSectionProps {
  id: string;
  title: string;
  content: string;
  citations?: string[];
  children?: React.ReactNode;
  /** Render children without the "Matched Resources" divider/label (e.g. an
   *  empty-state lead-list section that shows only the request box). */
  hideMatchLabel?: boolean;
}

export const ReportSection = ({ id, title, content, citations = [], children, hideMatchLabel = false }: ReportSectionProps) => {
  const config = SECTION_CONFIG[id];
  const Icon = config?.icon;
  const accentBorder = config?.accentColor || '';
  const accentBg = config?.accentBg || 'bg-muted text-muted-foreground';
  const matchLabel = config?.matchLabel || 'Matched Resources';
  // An array of children whose entries are all null (a section with no matches
  // AND no request box) is still truthy, so gating on `children` alone rendered
  // an orphan "RELATED RESOURCES / ACTION ITEMS / SETUP RESOURCES" divider under
  // a bare section (Floats2 review N2). Count only actually-renderable children.
  const hasChildren = React.Children.toArray(children).length > 0;

  return (
    <section id={id} className="scroll-mt-20" data-report-section>
      <Card className={`border-border/50 shadow-sm border-t-[3px] ${accentBorder}`}>
        <CardHeader className="pt-6 px-6 pb-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            {Icon && (
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${accentBg}`}>
                <Icon className="w-5 h-5" />
              </span>
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-5">
          <div className="prose max-w-none text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/90 prose-p:mb-4 prose-headings:mt-8 prose-headings:mb-3 prose-li:my-1 leading-relaxed report-prose">
            <CitationRenderer content={content} citations={citations} />
          </div>

          {/* Divider + labeled match cards area */}
          {hasChildren && (
            <div className="pt-2">
              {!hideMatchLabel && (
                <div className="flex items-center gap-3 mb-4">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {matchLabel}
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
