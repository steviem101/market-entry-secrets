import { useState } from "react";
import type React from "react";

interface RequestHookProps {
  copy: React.ReactNode;
  buttonLabel: string;
  confirmation: string;
  /** Persistence side-effect (ticket 14). Fires once, on first click. */
  onRequest?: () => void;
  className?: string;
}

/**
 * Shared request hook: dashed card + sky button → inline green confirmation
 * (README interactions). State is per-mount for now; Supabase persistence +
 * ops notification arrive in ticket 14.
 */
const RequestHook = ({ copy, buttonLabel, confirmation, onRequest, className }: RequestHookProps) => {
  const [requested, setRequested] = useState(false);
  if (requested) {
    return (
      <div className="mt-3 rounded-[10px] border border-report-confirm-border bg-report-confirm-bg px-[22px] py-3 text-[12.5px] font-medium leading-[1.6] text-report-confirm-text">
        {confirmation}
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-between gap-6 rounded-xl border border-dashed border-report-dash bg-report-hook-bg px-7 py-5 ${className ?? ""}`}
    >
      <span className="text-[12.5px] leading-[1.65] text-report-ink-soft">{copy}</span>
      <button
        type="button"
        onClick={() => {
          setRequested(true);
          onRequest?.();
        }}
        className="whitespace-nowrap rounded-lg bg-report-sky px-[22px] py-[11px] text-[12.5px] font-bold text-white transition-colors hover:bg-report-action"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default RequestHook;
