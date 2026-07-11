import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";

interface SectorSectionProps {
  title: string;
  viewAllLink: string;
  viewAllText: string;
  children: ReactNode;
  kicker?: string;
  subhead?: string;
  isEmpty?: boolean;
}

// Landing-page section wrapper (sectors + locations). Uses the shared MES
// editorial header register so these pages match the country pages.
const SectorSection = ({
  title,
  viewAllLink,
  viewAllText,
  children,
  kicker,
  subhead,
  isEmpty = false,
}: SectorSectionProps) => {
  if (isEmpty) return null;

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <SectionHeading kicker={kicker} title={title} subhead={subhead} />
        <Link to={viewAllLink} className="shrink-0">
          <Button variant="outline">{viewAllText}</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  );
};

export default SectorSection;
