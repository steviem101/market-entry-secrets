import { useScrollSpy } from '@/hooks/useScrollSpy';
import { Progress } from '@/components/ui/progress';
import { SECTION_CONFIG, SECTION_LABELS } from './reportSectionConfig';

interface Section {
  id: string;
  label: string;
  visible: boolean;
}

interface ReportSidebarProps {
  sections: Section[];
}

export const ReportSidebar = ({ sections }: ReportSidebarProps) => {
  const sectionIds = sections.map((s) => s.id);
  const { activeSection, scrollToSection } = useScrollSpy({
    sectionIds,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0.1,
  });

  const visibleSections = sections.filter((s) => s.visible);
  const activeIndex = visibleSections.findIndex((s) => s.id === activeSection);
  const progressPercent = visibleSections.length > 0
    ? Math.round(((activeIndex + 1) / visibleSections.length) * 100)
    : 0;

  return (
    <nav className="sticky top-20 space-y-1" data-report-sidebar>
      {/* Progress */}
      <div className="mb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Contents
          </p>
          {activeIndex >= 0 && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {activeIndex + 1} / {visibleSections.length}
            </span>
          )}
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      {/* Section links */}
      {sections.map((section) => {
        const config = SECTION_CONFIG[section.id];
        const Icon = config?.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => section.visible && scrollToSection(section.id)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
              !section.visible
                ? 'text-muted-foreground/40 cursor-not-allowed'
                : isActive
                  ? 'bg-primary/8 text-foreground font-medium border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            disabled={!section.visible}
          >
            {Icon && (
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
            )}
            <span className="truncate">
              {SECTION_LABELS[section.id] || section.id}
            </span>
            {!section.visible && (
              <span className="ml-auto text-xs">🔒</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
