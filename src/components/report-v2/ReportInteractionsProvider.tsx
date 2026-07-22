import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShortlistItem {
  name: string;
  url: string;
  /** Section label for the §14 chip, e.g. "Provider". */
  section: string;
}

export type RequestType = "scan_request" | "brief_request" | "lead_request" | "book_request" | "checkbox";

interface ReportInteractionsValue {
  starred: ShortlistItem[];
  isStarred: (key: string) => boolean;
  toggleStar: (item: ShortlistItem) => void;
  /** Persist a request-hook event (ticket 14). No-op without a report id. */
  recordRequest: (type: RequestType, payload?: Record<string, unknown>) => void;
  /** Action-plan checkbox state (F3): durable per report + advisor-visible. */
  isChecked: (id: string) => boolean;
  toggleCheck: (id: string) => void;
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
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const lsKey = `mes_report_v2_shortlist_${storageKey ?? reportId ?? "dev"}`;
  const lsCheckKey = `mes_report_v2_checks_${storageKey ?? reportId ?? "dev"}`;

  useEffect(() => {
    let cancelled = false;
    // Clear prior report/harness state on a source switch so the reload never
    // shows the previous report's shortlist (and never writes a star against
    // the new report from stale state) while the fetch is in flight.
    setStarred([]);
    setChecked(new Set());
    if (reportId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("report_interactions")
        .select("type,payload,created_at")
        .eq("report_id", reportId)
        .in("type", ["star", "checkbox"])
        .order("created_at", { ascending: true })
        .then(({ data }: { data: { type: string; payload: { item?: ShortlistItem; on?: boolean; id?: string } }[] | null }) => {
          if (cancelled || !data) return;
          const latestStar = new Map<string, { item: ShortlistItem; on: boolean }>();
          const latestCheck = new Map<string, boolean>();
          for (const row of data) {
            if (row.type === "checkbox") {
              if (row.payload?.id) latestCheck.set(row.payload.id, !!row.payload?.on);
            } else {
              const item = row.payload?.item;
              if (item) latestStar.set(keyOf(item), { item, on: !!row.payload?.on });
            }
          }
          setStarred([...latestStar.values()].filter((v) => v.on).map((v) => v.item));
          setChecked(new Set([...latestCheck.entries()].filter(([, on]) => on).map(([id]) => id)));
        });
    } else {
      try {
        const raw = localStorage.getItem(lsKey);
        const parsed = raw ? JSON.parse(raw) : null;
        // Validate the shape — valid-but-wrong JSON ("null", an object) would
        // otherwise poison `starred` and crash downstream .map/.some/.length.
        if (Array.isArray(parsed) && !cancelled) setStarred(parsed as ShortlistItem[]);
        const rawC = localStorage.getItem(lsCheckKey);
        const parsedC = rawC ? JSON.parse(rawC) : null;
        if (Array.isArray(parsedC) && !cancelled) setChecked(new Set(parsedC as string[]));
      } catch {
        /* ignore malformed local state */
      }
    }
    return () => {
      cancelled = true;
    };
  }, [reportId, lsKey, lsCheckKey]);

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

  const isChecked = useCallback((id: string) => checked.has(id), [checked]);

  const toggleCheck = useCallback(
    (id: string) => {
      const on = !checked.has(id);
      const next = new Set(checked);
      if (on) next.add(id);
      else next.delete(id);
      setChecked(next);
      if (reportId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("report_interactions")
          .insert({ report_id: reportId, type: "checkbox", payload: { id, on } })
          .then(
            () => {},
            () => {}
          );
      } else {
        try {
          localStorage.setItem(lsCheckKey, JSON.stringify([...next]));
        } catch {
          /* ignore quota errors */
        }
      }
    },
    [checked, reportId, lsCheckKey]
  );

  return (
    <Ctx.Provider value={{ starred, isStarred, toggleStar, recordRequest, isChecked, toggleCheck }}>
      {children}
    </Ctx.Provider>
  );
};
