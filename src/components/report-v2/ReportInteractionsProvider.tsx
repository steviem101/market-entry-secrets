import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShortlistItem {
  name: string;
  url: string;
  /** Section label for the §14 chip, e.g. "Provider". */
  section: string;
}

export type RequestType = "scan_request" | "brief_request" | "lead_request";

interface ReportInteractionsValue {
  starred: ShortlistItem[];
  isStarred: (key: string) => boolean;
  toggleStar: (item: ShortlistItem) => void;
  /** Persist a request-hook event (ticket 14). No-op without a report id. */
  recordRequest: (type: RequestType, payload?: Record<string, unknown>) => void;
}

const keyOf = (item: { url: string; name: string }) => item.url || item.name;

const Ctx = createContext<ReportInteractionsValue | null>(null);

export const useReportInteractions = (): ReportInteractionsValue => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReportInteractions must be used within ReportInteractionsProvider");
  return ctx;
};

interface ProviderProps {
  /** Real report id → persist to Supabase report_interactions. */
  reportId?: string;
  /** Dev harness key → localStorage (no auth / no real report row). */
  storageKey?: string;
  children: React.ReactNode;
}

/**
 * Report-scoped interaction store (DECISIONS #5). With a reportId it persists
 * to the report_interactions table (event-log: each star toggle is a row,
 * state = latest per entity); in the dev harness it falls back to localStorage
 * so the star → refresh → still-starred done-check works without auth.
 */
export const ReportInteractionsProvider = ({ reportId, storageKey, children }: ProviderProps) => {
  const [starred, setStarred] = useState<ShortlistItem[]>([]);
  const lsKey = `mes_report_v2_shortlist_${storageKey ?? reportId ?? "dev"}`;

  useEffect(() => {
    let cancelled = false;
    if (reportId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("report_interactions")
        .select("payload,created_at")
        .eq("report_id", reportId)
        .eq("type", "star")
        .order("created_at", { ascending: true })
        .then(({ data }: { data: { payload: { item?: ShortlistItem; on?: boolean } }[] | null }) => {
          if (cancelled || !data) return;
          const latest = new Map<string, { item: ShortlistItem; on: boolean }>();
          for (const row of data) {
            const item = row.payload?.item;
            if (item) latest.set(keyOf(item), { item, on: !!row.payload?.on });
          }
          setStarred([...latest.values()].filter((v) => v.on).map((v) => v.item));
        });
    } else {
      try {
        const raw = localStorage.getItem(lsKey);
        if (raw && !cancelled) setStarred(JSON.parse(raw) as ShortlistItem[]);
      } catch {
        /* ignore malformed local state */
      }
    }
    return () => {
      cancelled = true;
    };
  }, [reportId, lsKey]);

  const toggleStar = useCallback(
    (item: ShortlistItem) => {
      const on = !starred.some((x) => keyOf(x) === keyOf(item));
      const next = on ? [...starred, item] : starred.filter((x) => keyOf(x) !== keyOf(item));
      setStarred(next);
      if (reportId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("report_interactions")
          .insert({ report_id: reportId, type: "star", payload: { item, on } })
          .then(
            () => {},
            () => {}
          );
      } else {
        try {
          localStorage.setItem(lsKey, JSON.stringify(next));
        } catch {
          /* ignore quota errors */
        }
      }
    },
    [starred, reportId, lsKey]
  );

  const recordRequest = useCallback(
    (type: RequestType, payload: Record<string, unknown> = {}) => {
      if (!reportId) return; // harness has no report row; requests are UI-only there
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("report_interactions")
        .insert({ report_id: reportId, type, payload })
        .then(
          () => {},
          () => {}
        );
    },
    [reportId]
  );

  const isStarred = useCallback((key: string) => starred.some((x) => keyOf(x) === key), [starred]);

  return <Ctx.Provider value={{ starred, isStarred, toggleStar, recordRequest }}>{children}</Ctx.Provider>;
};
