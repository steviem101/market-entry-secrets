import { format, isPast, differenceInDays } from "date-fns";

export type DatePrecision = "exact" | "month" | "tbc";

export interface EventDateFields {
  date: string;
  date_precision?: DatePrecision | null;
  typical_month?: string | null;
}

const toDate = (input: string) => new Date(input);

/** Long, human-friendly date string for hero/detail views. */
export const formatEventDateLong = (event: EventDateFields): string => {
  const precision = event.date_precision ?? "exact";
  const d = toDate(event.date);
  if (precision === "tbc") return "Date TBC";
  if (precision === "month") {
    const month = event.typical_month?.trim() || format(d, "MMMM");
    return `Typically ${month} ${format(d, "yyyy")}`;
  }
  return format(d, "EEEE, d MMMM yyyy");
};

/** Whether the event is past, accounting for approximate dates (month/TBC precision are never "past"). */
export const isEventPast = (event: EventDateFields): boolean => {
  const precision = event.date_precision ?? "exact";
  if (precision !== "exact") return false;
  return isPast(toDate(event.date));
};

/** Days-until label for upcoming exact-date events, otherwise null. */
export const daysUntilLabel = (event: EventDateFields): string | null => {
  const precision = event.date_precision ?? "exact";
  if (precision !== "exact") return null;
  const days = differenceInDays(toDate(event.date), new Date());
  if (days < 0 || days > 30) return null;
  if (days === 0) return "Today";
  return `In ${days} days`;
};

/** Whether to show the Add-to-Calendar action — only meaningful when the date is exact. */
export const canAddToCalendar = (event: EventDateFields): boolean =>
  (event.date_precision ?? "exact") === "exact";
