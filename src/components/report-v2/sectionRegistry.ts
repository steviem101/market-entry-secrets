import type React from "react";
import type { Report } from "@/types/report";
import Cover from "./Cover";
import CloseSection from "./CloseSection";
import AccountsSection from "./AccountsSection";
import ActionPlanSection from "./ActionPlanSection";
import ComplianceSection from "./ComplianceSection";
import CompetitorSection from "./CompetitorSection";
import EventsSection from "./EventsSection";
import ExecSummarySection from "./ExecSummarySection";
import GovHubsSection from "./GovHubsSection";
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
  /** Caps section label, e.g. "05 · SERVICE PROVIDERS" (DECISIONS #9). */
  label: string;
  Component?: React.ComponentType<{ report: Report }>;
}

export const REPORT_V2_SECTIONS: ReportSectionDef[] = [
  { id: "cover", label: "COVER", Component: Cover },
  { id: "exec", label: "01 · EXECUTIVE SUMMARY", Component: ExecSummarySection },
  { id: "metricsSwot", label: "02 · KEY MARKET METRICS & STRATEGIC POSITION", Component: MetricsSwotSection },
  { id: "competitors", label: "03 · COMPETITOR LANDSCAPE", Component: CompetitorSection },
  { id: "accounts", label: "04 · YOUR FIRST CUSTOMERS", Component: AccountsSection },
  { id: "providers", label: "05 · SERVICE PROVIDERS", Component: ProvidersSection },
  { id: "govAndHubs", label: "06 · GOVERNMENT, TRADE SUPPORT & ACCELERATORS", Component: GovHubsSection },
  { id: "mentors", label: "07 · MENTOR RECOMMENDATIONS", Component: MentorsSection },
  { id: "investors", label: "08 · INVESTOR RECOMMENDATIONS", Component: InvestorsSection },
  { id: "events", label: "09 · EVENTS — HIGH-SIGNAL ROOMS THIS QUARTER", Component: EventsSection },
  { id: "actionPlan", label: "10 · PHASED ACTION PLAN", Component: ActionPlanSection },
  { id: "compliance", label: "11 · SETUP & COMPLIANCE", Component: ComplianceSection },
  { id: "guides", label: "12 · CASE STUDIES & RESOURCES", Component: GuidesSection },
  { id: "leads", label: "13 · LEAD LIST & MARKET DATA", Component: LeadsSection },
  { id: "close", label: "14 · NEXT: YOUR ADVISORY SESSION", Component: CloseSection },
  { id: "sources", label: "SOURCES", Component: SourcesBand },
];
