import { Helmet } from "react-helmet-async";
import { publishedOrigin } from "@/lib/publishedOrigin";

type JsonLdType =
  | "LocalBusiness"
  | "Person"
  | "Event"
  | "Article"
  | "Place"
  | "Dataset"
  | "Organization"
  | "BreadcrumbList"
  | "FAQPage"
  | "HowTo"
  | "CollectionPage"
  | "ItemList";

export interface JsonLdBlock {
  type: JsonLdType;
  data: Record<string, unknown>;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: "website" | "article";
  jsonLd?: JsonLdBlock | JsonLdBlock[];
}

const buildLd = (block: JsonLdBlock) => ({
  "@context": "https://schema.org",
  "@type": block.type,
  ...block.data,
});

export const SEOHead = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  const origin = publishedOrigin();
  const canonicalUrl = `${origin}${canonicalPath}`;
  const truncatedDescription = description?.slice(0, 160) || "";
  // Fall back to the sitewide social card so index/taxonomy pages that pass no
  // ogImage still emit a per-page (not shell-default) OG/Twitter image.
  const socialImage = ogImage || `${origin}/og-image.png`;

  const blocks: JsonLdBlock[] = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={truncatedDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={socialImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={socialImage} />
      <link rel="canonical" href={canonicalUrl} />
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(buildLd(block))}
        </script>
      ))}
    </Helmet>
  );
};
