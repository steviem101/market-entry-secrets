import { Helmet } from "react-helmet-async";

type JsonLdType =
  | "LocalBusiness"
  | "Person"
  | "Event"
  | "Article"
  | "Place"
  | "Dataset"
  | "Organization";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: "website" | "article";
  jsonLd?: {
    type: JsonLdType;
    data: Record<string, unknown>;
  };
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://market-entry-secrets.lovable.app";

export const SEOHead = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const truncatedDescription = description?.slice(0, 160) || "";

  const buildJsonLd = () => {
    if (!jsonLd) return null;
    return {
      "@context": "https://schema.org",
      "@type": jsonLd.type,
      ...jsonLd.data,
    };
  };

  const structuredData = buildJsonLd();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={truncatedDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <link rel="canonical" href={canonicalUrl} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
