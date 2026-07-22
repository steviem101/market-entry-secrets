import type React from "react";
import type { Report } from "@/types/report";
import Cover from "./Cover";
import HowToReadCard from "./HowToReadCard";
import CloseSection from "./CloseSection";
import AccountsSection from "./AccountsSection";
import ActionPlanSection from "./ActionPlanSection";
import ComplianceSection from "./ComplianceSection";
import CompetitorSection from "./CompetitorSection";
import EventsSection from "./EventsSection";
import ExecSummarySection from "./ExecSummarySection";
import GovHubsSection from "./GovHubsSection";
import HubsSection from "./HubsSection";
import GuidesSection from "./GuidesSection";
import MentorsSection from "./MentorsSection";
import InvestorsSection from "./InvestorsSection";
import LeadsSection from "./LeadsSection";
import ProvidersSection from "./ProvidersSection";
import MetricsSwotSection from "./MetricsSwotSection";
import SourcesBand from "./SourcesBand";

/**
 * Ordered section registry for the report_v2 renderer (README "Page anatomy").
 * The /dev/report-preview harness walks this list in order and renders each
 * section's component, or a labeled placeholder while it is unbuilt. Tickets
 * fill in `Component` one at a time — the order and labels never change.
 */
export interface ReportSectionDef {
  id: string;
  /** Caps section TITLE, e.g. "SERVICE PROVIDERS". The ordinal ("05 · ") is
   *  prepended by a CSS counter at render (see index.css), so a suppressed
   *  section never leaves a gap in the sequence (DECISIONS #9). */
  label: string;
  Component?: React.ComponentType<{ report: Report }>;
}

export const REPORT_V2_SECTIONS: ReportSectionDef[] = [
  { id: "cover", label: "COVER", Component: Cover },
  // Unnumbered orientation card (no SectionCard) — sits between cover and §01 and
  // does not advance the section counter or appear in the scroll-spy nav.
  { id: "howToRead", label: "HOW TO READ", Component: HowToReadCard },
  { id: "exec", label: "EXECUTIVE SUMMARY", Component: ExecSummarySection },
  { id: "metricsSwot", label: "KEY MARKET METRICS & STRATEGIC POSITION", Component: MetricsSwotSection },
  { id: "competitors", label: "COMPETITOR LANDSCAPE", Component: CompetitorSection },
  { id: "accounts", label: "YOUR FIRST CUSTOMERS", Component: AccountsSection },
  { id: "providers", label: "SERVICE PROVIDERS", Component: ProvidersSection },
  { id: "govAndHubs", label: "GOVERNMENT & TRADE SUPPORT", Component: GovHubsSection },
  { id: "hubs", label: "INNOVATION HUBS & ACCELERATORS", Component: HubsSection },
  { id: "mentors", label: "MENTOR RECOMMENDATIONS", Component: MentorsSection },
  { id: "investors", label: "INVESTOR RECOMMENDATIONS", Component: InvestorsSection },
  { id: "events", label: "EVENTS — HIGH-SIGNAL ROOMS", Component: EventsSection },
  // Case studies sit between the two heaviest prose sections (Action Plan +
  // Setup & Compliance) so they don't stack back-to-back, and so the tail
  // alternates heavy/light instead of fizzling into three thin sections in a
  // row (numbers follow the order automatically via the CSS counter).
  { id: "actionPlan", label: "PHASED ACTION PLAN", Component: ActionPlanSection },
  { id: "guides", label: "CASE STUDIES & RESOURCES", Component: GuidesSection },
  { id: "compliance", label: "SETUP & COMPLIANCE", Component: ComplianceSection },
  { id: "leads", label: "LEAD LIST & MARKET DATA", Component: LeadsSection },
  { id: "close", label: "NEXT: YOUR ADVISORY SESSION", Component: CloseSection },
  { id: "sources", label: "SOURCES", Component: SourcesBand },
];
