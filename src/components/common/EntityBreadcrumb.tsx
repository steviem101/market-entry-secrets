import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publishedOrigin } from "@/lib/publishedOrigin";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface EntityBreadcrumbProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export const EntityBreadcrumb = ({ segments, className }: EntityBreadcrumbProps) => {
  // Emit BreadcrumbList JSON-LD alongside the visible trail so every detail /
  // taxonomy page that renders this component gets crawlable breadcrumb schema.
  // Per schema.org guidance the final (current) crumb may omit `item`.
  const origin = publishedOrigin();
  const crumbs: BreadcrumbSegment[] = [{ label: "Home", href: "/" }, ...segments];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${origin}${crumb.href}` } : {}),
    })),
  };

  return (
    <nav className={`container mx-auto px-4 py-4 ${className || ""}`} aria-label="Breadcrumb">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            return (
              <span key={index} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast || !segment.href ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};
