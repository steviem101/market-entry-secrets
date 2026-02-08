import { useScrollSpy } from '@/hooks/useScrollSpy';

interface Section {
  id: string;
  label: string;
  visible: boolean;
}

interface ReportSidebarProps {
  sections: Section[];
}

const SECTION_LABELS: Record<string, string> = {
  executive_summary: 'Executive Summary',
  swot_analysis: 'SWOT Analysis',
  competitor_landscape: 'Competitor Landscape',
  service_providers: 'Service Providers',
  mentor_recommendations: 'Mentor Recommendations',
  events_resources: 'Events & Resources',
  action_plan: 'Action Plan',
  lead_list: 'Lead List',
};

export const ReportSidebar = ({ sections }: ReportSidebarProps) => {
  return (
    <nav className="sticky top-20 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Contents
      </p>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
            section.visible
              ? 'text-foreground hover:bg-muted'
              : 'text-muted-foreground/50 pointer-events-none'
          }`}
        >
          {SECTION_LABELS[section.id] || section.id}
          {!section.visible && (
            <span className="ml-1 text-xs">🔒</span>
          )}
        </a>
      ))}
    </nav>
  );
};
