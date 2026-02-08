import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { SECTION_CONFIG, SECTION_LABELS } from './reportSectionConfig';
import { Progress } from '@/components/ui/progress';
import { useScrollSpy } from '@/hooks/useScrollSpy';

interface Section {
  id: string;
  label: string;
  visible: boolean;
}

interface ReportMobileTOCProps {
  sections: Section[];
}

export const ReportMobileTOC = ({ sections }: ReportMobileTOCProps) => {
  const [open, setOpen] = useState(false);
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

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setOpen(false);
  };

  return (
    <div className="lg:hidden print:hidden">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-6 left-6 z-40 rounded-full shadow-lg bg-background/90 backdrop-blur-sm gap-1.5"
          >
            <List className="w-4 h-4" />
            Contents
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center justify-between">
              <span>Contents</span>
              {activeIndex >= 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {activeIndex + 1} / {visibleSections.length}
                </span>
              )}
            </DrawerTitle>
            <Progress value={progressPercent} className="h-1 mt-2" />
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1 max-h-[60vh] overflow-y-auto">
            {sections.map((section) => {
              const config = SECTION_CONFIG[section.id];
              const Icon = config?.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => section.visible && handleNavClick(section.id)}
                  disabled={!section.visible}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                    !section.visible
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : isActive
                        ? 'bg-primary/8 text-foreground font-medium border-l-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  )}
                  <span>{SECTION_LABELS[section.id] || section.id}</span>
                  {!section.visible && <span className="ml-auto text-xs">🔒</span>}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
