
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface SectorSectionProps {
  title: string;
  viewAllLink: string;
  viewAllText: string;
  children: ReactNode;
  isEmpty?: boolean;
}

const SectorSection = ({ 
  title, 
  viewAllLink, 
  viewAllText, 
  children, 
  isEmpty = false 
}: SectorSectionProps) => {
  if (isEmpty) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={viewAllLink}>
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
