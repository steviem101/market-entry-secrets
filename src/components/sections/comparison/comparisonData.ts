export type Status = "no" | "partial" | "yes";

export interface ComparisonRowData {
  feature: string;
  google: { status: Status; pill: string; tooltip: string };
  consultant: { status: Status; pill: string; tooltip: string };
  mes: { status: Status; pill: string };
}

export const COMPARISON_ROWS: ComparisonRowData[] = [
  {
    feature: "Time to first insight",
    google: {
      status: "partial",
      pill: "Hours of DIY",
      tooltip: "Results are instant but require hours of manual research and synthesis",
    },
    consultant: {
      status: "no",
      pill: "Days to weeks",
      tooltip: "Engagements typically take days to weeks before first deliverable",
    },
    mes: { status: "yes", pill: "Under 10 minutes" },
  },
  {
    feature: "Cost",
    google: {
      status: "yes",
      pill: "Free (your time isn't)",
      tooltip: "Free to search, but your time is the hidden cost",
    },
    consultant: {
      status: "no",
      pill: "$10K–$50K+",
      tooltip: "Market entry projects typically start at $10K–$50K+",
    },
    mes: { status: "yes", pill: "From $0" },
  },
  {
    feature: "Vetted provider matching",
    google: {
      status: "no",
      pill: "No vetting",
      tooltip: "No vetting — results ranked by SEO, not relevance or quality",
    },
    consultant: {
      status: "partial",
      pill: "Limited network",
      tooltip: "May recommend partners from their own network, which can be limited",
    },
    mes: { status: "yes", pill: "AI-matched" },
  },
  {
    feature: "Custom AI market report",
    google: {
      status: "no",
      pill: "Just links",
      tooltip: "No structured report output — just links to sift through",
    },
    consultant: {
      status: "partial",
      pill: "Weeks + $$$",
      tooltip: "Custom reports available but take weeks and cost thousands",
    },
    mes: { status: "yes", pill: "SWOT, leads & more" },
  },
  {
    feature: "ANZ ecosystem access",
    google: {
      status: "no",
      pill: "None",
      tooltip: "No curated directory of mentors, trade agencies, or innovation hubs",
    },
    consultant: {
      status: "partial",
      pill: "Their network only",
      tooltip: "Access limited to the consultant's personal network",
    },
    mes: { status: "yes", pill: "Full directory" },
  },
  {
    feature: "ANZ-specific data",
    google: {
      status: "partial",
      pill: "Scattered",
      tooltip: "Some data exists but scattered across many sources, not aggregated",
    },
    consultant: {
      status: "partial",
      pill: "Varies by person",
      tooltip: "Quality depends on the individual consultant's local knowledge",
    },
    mes: { status: "yes", pill: "Purpose-built" },
  },
  {
    feature: "Continuously updated",
    google: {
      status: "partial",
      pill: "Redo research",
      tooltip: "Web results update, but you have to re-do your research each time",
    },
    consultant: {
      status: "no",
      pill: "Point-in-time",
      tooltip: "Reports are point-in-time — updates require a new engagement",
    },
    mes: { status: "yes", pill: "Live data" },
  },
];
