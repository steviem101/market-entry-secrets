import type { JsonLdBlock } from "@/components/common/SEOHead";
import type { CountryFaq, CountryPlaybookStage } from "@/lib/countryPageContent";

interface BuildBlocksArgs {
  countryName: string;
  countrySlug: string;
  countryDescription?: string | null;
  canonicalUrl: string;
  baseUrl: string;
  faqs: CountryFaq[];
  playbook: CountryPlaybookStage[];
  events: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    date?: string | null;
    location?: string | null;
    slug?: string | null;
  }>;
  cities: Array<{
    id: string;
    name: string;
    slug: string;
    hero_description?: string | null;
  }>;
}

export const buildCountryJsonLd = ({
  countryName,
  countrySlug,
  countryDescription,
  canonicalUrl,
  baseUrl,
  faqs,
  playbook,
  events,
  cities,
}: BuildBlocksArgs): JsonLdBlock[] => {
  const blocks: JsonLdBlock[] = [];

  blocks.push({
    type: "BreadcrumbList",
    data: {
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Explore", item: `${baseUrl}/` },
        { "@type": "ListItem", position: 2, name: "By Country", item: `${baseUrl}/countries` },
        { "@type": "ListItem", position: 3, name: countryName, item: canonicalUrl },
      ],
    },
  });

  blocks.push({
    type: "Place",
    data: {
      name: countryName,
      description: countryDescription || `Market entry origin: ${countryName}`,
      url: canonicalUrl,
    },
  });

  blocks.push({
    type: "Organization",
    data: {
      name: "Market Entry Secrets",
      url: baseUrl,
    },
  });

  if (faqs.length) {
    blocks.push({
      type: "FAQPage",
      data: {
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    });
  }

  if (playbook.length) {
    blocks.push({
      type: "HowTo",
      data: {
        name: `${countryName} to Australia market entry playbook`,
        description: `Six-stage founder playbook for scaling from ${countryName} to Australia.`,
        totalTime: "P12M",
        step: playbook.map((s) => ({
          "@type": "HowToStep",
          position: s.stage_number,
          name: s.title,
          text: s.summary,
        })),
      },
    });
  }

  events.forEach((e) => {
    if (!e.title) return;
    blocks.push({
      type: "Event",
      data: {
        name: e.title,
        startDate: e.date,
        location: e.location
          ? { "@type": "Place", name: e.location }
          : undefined,
        description: e.description || undefined,
        url: e.slug ? `${baseUrl}/events/${e.slug}` : undefined,
      },
    });
  });

  cities.forEach((c) => {
    blocks.push({
      type: "Place",
      data: {
        name: c.name,
        description: c.hero_description || undefined,
        url: `${baseUrl}/locations/${c.slug}`,
      },
    });
  });

  return blocks;
};
