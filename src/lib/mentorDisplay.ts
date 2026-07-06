/**
 * Pure display helpers for mentor identity masking.
 *
 * Identity data for anonymous mentors is already withheld server-side by the
 * community_members_public view (alias name, masked headline, "Undisclosed"
 * company, NULL image, empty experience_tiles, anon-<id> slug). These helpers
 * cover the presentation layer on top of that: which heading to show and
 * whether initials may be derived, so cards and the profile page mask
 * consistently and never leak identity through a fallback path.
 */

export interface MentorIdentity {
  name: string;
  title: string;
  is_anonymous: boolean;
}

/** Card/profile heading: anonymous mentors surface their masked headline. */
export const mentorDisplayName = (m: MentorIdentity): string =>
  m.is_anonymous ? m.title : m.name;

/**
 * Avatar initials. Returns null for anonymous mentors — callers render a
 * neutral glyph (Globe) instead, never initials derived from any field.
 */
export const mentorInitials = (m: MentorIdentity): string | null => {
  if (m.is_anonymous) return null;
  return m.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
