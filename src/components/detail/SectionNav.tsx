interface Section {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
}

interface SectionNavProps {
  sections: Section[];
  scrollToSection: (slug: string) => void;
  variant: "sidebar" | "mobile";
}

export const SectionNav = ({ sections, scrollToSection, variant }: SectionNavProps) => {
  if (sections.length === 0) return null;

  if (variant === "mobile") {
    return (
      <div className="lg:hidden mb-6">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.slug)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                section.isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.slug)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            section.isActive
              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
};
