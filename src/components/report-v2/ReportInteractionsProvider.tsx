import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShortlistItem {
  name: string;
  url: string;
  /** Section label for the §14 chip, e.g. "Provider". */
  section: string;
}

export type RequestType = "scan_request" | "brief_request" | "lead_request" | "book_request";

interface ReportInteractionsValue {
  starred: ShortlistItem[];
  isStarred: (key: string) => boolean;
  toggleStar: (item: ShortlistItem) => void;
  /** Persist a request-hook event (ticket 14). No-op without a report id. */
  recordRequest: (type: RequestType, payload?: Record<string, unknown>) => void;
  /** Action-plan checkbox state (F3): durable per report + advisor-visible. */
  isChecked: (id: string) => boolean;
  toggleCheck: (id: string) => void;
  /** True once a book_request exists for this report (F3): lets the booking CTA
   *  show its confirmation across reloads and guards against a duplicate emit. */
  hasBooked: boolean;
}

const keyOf = (item: { url: string; name: string }) => item.url || item.name;

// Bound on the interaction-log read. Well above any real per-report event count
// (a handful of stars/checks + a booking), but explicit so the read never rides
// the implicit 1000-row cap and silently loses rows. Mirrors the admin read.
const INTERACTION_READ_CAP = 2000;

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
  const [booked, setBooked] = useState(false);
  const lsKey = `mes_report_v2_shortlist_${storageKey ?? reportId ?? "dev"}`;
  const lsCheckKey = `mes_report_v2_checks_${storageKey ?? reportId ?? "dev"}`;

  useEffect(() => {
    let cancelled = false;
    // Clear prior report/harness state on a source switch so the reload never
    // shows the previous report's shortlist (and never writes a star against
    // the new report from stale state) while the fetch is in flight.
    setStarred([]);
    setChecked(new Set());
    setBooked(false);
    if (reportId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("report_interactions")
        .select("type,payload,created_at")
        .eq("report_id", reportId)
        .in("type", ["star", "checkbox", "book_request"])
        // Newest-first + an explicit cap: the event log grows unbounded, and the
        // default 1000-row cap on an ASCENDING read would silently drop the NEWEST
        // rows — showing stale stars/checks and reading hasBooked=false after a
        // real booking (CLAUDE.md gotcha #1). Reversed back to ascending below so
        // the "latest write wins" reducer stays correct.
        .order("created_at", { ascending: false })
        .limit(INTERACTION_READ_CAP)
        .then(({ data }: { data: { type: string; payload: { item?: ShortlistItem; on?: boolean; id?: string } }[] | null }) => {
          if (cancelled || !data) return;
          const latestStar = new Map<string, { item: ShortlistItem; on: boolean }>();
          const latestCheck = new Map<string, boolean>();
          let anyBooked = false;
          for (const row of [...data].reverse()) {
            if (row.type === "checkbox") {
              if (row.payload?.id) latestCheck.set(row.payload.id, !!row.payload?.on);
            } else if (row.type === "book_request") {
              anyBooked = true;
            } else {
              const item = row.payload?.item;
              if (item) latestStar.set(keyOf(item), { item, on: !!row.payload?.on });
            }
          }
          setStarred([...latestStar.values()].filter((v) => v.on).map((v) => v.item));
          setChecked(new Set([...latestCheck.entries()].filter(([, on]) => on).map(([id]) => id)));
          setBooked(anyBooked);
        });
    } else {
      // Two independent try blocks: a corrupt shortlist value must not abort the
      // checkbox hydration (they are separate keys with separate lifetimes).
      try {
        const raw = localStorage.getItem(lsKey);
        const parsed = raw ? JSON.parse(raw) : null;
        // Validate the shape — valid-but-wrong JSON ("null", an object) would
        // otherwise poison `starred` and crash downstream .map/.some/.length.
        if (Array.isArray(parsed) && !cancelled) setStarred(parsed as ShortlistItem[]);
      } catch {
        /* ignore malformed shortlist state */
      }
      try {
        const rawC = localStorage.getItem(lsCheckKey);
        const parsedC = rawC ? JSON.parse(rawC) : null;
        if (Array.isArray(parsedC) && !cancelled) setChecked(new Set(parsedC as string[]));
      } catch {
        /* ignore malformed checkbox state */
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
    <Ctx.Provider value={{ starred, isStarred, toggleStar, recordRequest, isChecked, toggleCheck, hasBooked: booked }}>
      {children}
    </Ctx.Provider>
  );
};
