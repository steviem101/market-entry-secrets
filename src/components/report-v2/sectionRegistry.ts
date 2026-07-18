import type React from "react";
import type { Report } from "@/types/report";
import Cover from "./Cover";
import CloseSection from "./CloseSection";
import SourcesBand from "./SourcesBand";

/**
 * Ordered section registry for the report_v2 renderer (README "Page anatomy").
 * The /dev/report-preview harness walks this list in order and renders each
 * section's component, or a labeled placeholder while it is unbuilt. Tickets
 * fill in `Component` one at a time — the order and labels never change.
 */
export interface ReportSectionDef {
  id: string;
  /** Mono-caps section label, e.g. "05 · SERVICE PROVIDERS" (DECISIONS #9). */
  label: string;
  Component?: React.ComponentType<{ report: Report }>;
}

export const REPORT_V2_SECTIONS: ReportSectionDef[] = [
  { id: "cover", label: "COVER", Component: Cover },
  { id: "exec", label: "01 · EXECUTIVE SUMMARY" },
  { id: "metricsSwot", label: "02 · MARKET METRICS & SWOT" },
  { id: "competitors", label: "03 · COMPETITOR LANDSCAPE" },
  { id: "accounts", label: "04 · FIRST CUSTOMERS" },
  { id: "providers", label: "05 · SERVICE PROVIDERS" },
  { id: "govAndHubs", label: "06 · GOVERNMENT & ACCELERATORS" },
  { id: "mentors", label: "07 · MENTORS" },
  { id: "investors", label: "08 · INVESTORS" },
  { id: "events", label: "09 · EVENTS" },
  { id: "actionPlan", label: "10 · ACTION PLAN" },
  { id: "compliance", label: "11 · SETUP & COMPLIANCE" },
  { id: "guides", label: "12 · CASE STUDIES & GUIDES" },
  { id: "leads", label: "13 · LEAD LIST" },
  { id: "close", label: "14 · NEXT: YOUR ADVISORY SESSION", Component: CloseSection },
  { id: "sources", label: "SOURCES", Component: SourcesBand },
];
