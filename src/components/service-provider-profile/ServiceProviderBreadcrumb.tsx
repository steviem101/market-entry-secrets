import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ServiceProviderBreadcrumbProps {
  providerName: string;
  categoryName?: string | null;
}

export const ServiceProviderBreadcrumb = ({
  providerName,
  categoryName,
}: ServiceProviderBreadcrumbProps) => {
  return (
    <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/service-providers" className="hover:text-primary transition-colors">
            Service Providers
          </Link>
        </li>
        {categoryName && (
          <>
            <ChevronRight className="w-4 h-4" />
            <li>
              <span className="text-muted-foreground">{categoryName}</span>
            </li>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <li>
          <span className="text-foreground font-medium">{providerName}</span>
        </li>
      </ol>
    </nav>
  );
};
