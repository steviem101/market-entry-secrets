/**
 * The events_resources section's match array carries both events and
 * content_items (case studies, guides) glued together by the edge
 * function. Render them under one heading and case studies show up as
 * "Upcoming Events" — a misleading mix that prompted this split.
 *
 * Heuristic: an item is treated as a "resource" if its linkLabel is
 * "Read More" or its link points at /content/. Everything else stays
 * an event. Both ReportView and SharedReportView use this so the two
 * surfaces stay visually consistent.
 */
export interface SectionMatch {
  link?: string;
  linkLabel?: string;
  [key: string]: unknown;
}

export interface EventsSplit<T extends SectionMatch> {
  events: T[];
  resources: T[];
}

export const splitEventsAndResources = <T extends SectionMatch>(items: T[]): EventsSplit<T> => {
  const events: T[] = [];
  const resources: T[] = [];
  for (const m of items) {
    const isResource =
      m?.linkLabel === 'Read More' ||
      (typeof m?.link === 'string' && m.link.startsWith('/content/'));
    if (isResource) resources.push(m);
    else events.push(m);
  }
  return { events, resources };
};
