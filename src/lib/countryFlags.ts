/**
 * Country → flag-emoji lookup, extracted from CaseStudies for reuse and testing.
 * Unknown / missing countries fall back to a neutral globe.
 */
export const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "\u{1F1FA}\u{1F1F8}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}",
  "Canada": "\u{1F1E8}\u{1F1E6}",
  "Germany": "\u{1F1E9}\u{1F1EA}",
  "France": "\u{1F1EB}\u{1F1F7}",
  "Japan": "\u{1F1EF}\u{1F1F5}",
  "China": "\u{1F1E8}\u{1F1F3}",
  "India": "\u{1F1EE}\u{1F1F3}",
  "Singapore": "\u{1F1F8}\u{1F1EC}",
  "Israel": "\u{1F1EE}\u{1F1F1}",
  "South Korea": "\u{1F1F0}\u{1F1F7}",
  "Sweden": "\u{1F1F8}\u{1F1EA}",
  "Netherlands": "\u{1F1F3}\u{1F1F1}",
  "Ireland": "\u{1F1EE}\u{1F1EA}",
  "New Zealand": "\u{1F1F3}\u{1F1FF}",
  "Australia": "\u{1F1E6}\u{1F1FA}",
  "Brazil": "\u{1F1E7}\u{1F1F7}",
  "Switzerland": "\u{1F1E8}\u{1F1ED}",
  "Italy": "\u{1F1EE}\u{1F1F9}",
  "Spain": "\u{1F1EA}\u{1F1F8}",
};

const GLOBE = "\u{1F30D}";

export const getCountryFlag = (country: string | null | undefined): string => {
  if (!country) return GLOBE;
  return COUNTRY_FLAGS[country] || GLOBE;
};
