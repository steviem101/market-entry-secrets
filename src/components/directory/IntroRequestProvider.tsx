import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { WarmIntroModal, type IntroTarget, type IntroMode } from "./WarmIntroModal";

interface IntroRequestContextValue {
  /** Open the warm-intro flow for a person/company/investor/agency/hub. */
  requestIntro: (target: IntroTarget) => void;
  /** Open the soft enquiry flow for a lead list. */
  enquireLead: (target: IntroTarget) => void;
}

const IntroRequestContext = createContext<IntroRequestContextValue | null>(null);

/**
 * App-level host for the single warm-intro / lead-enquiry modal. Mounting this
 * once means every CardCTA can open the flow via useIntroRequest() without each
 * page wiring its own handler — closing the historic "dead Contact button" gap.
 */
export const IntroRequestProvider = ({ children }: { children: ReactNode }) => {
  const [target, setTarget] = useState<IntroTarget | null>(null);
  const [mode, setMode] = useState<IntroMode>("intro");
  const [open, setOpen] = useState(false);

  const requestIntro = useCallback((t: IntroTarget) => {
    setTarget(t);
    setMode("intro");
    setOpen(true);
  }, []);

  const enquireLead = useCallback((t: IntroTarget) => {
    setTarget({ ...t, entity: "lead_list" });
    setMode("enquiry");
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ requestIntro, enquireLead }), [requestIntro, enquireLead]);

  return (
    <IntroRequestContext.Provider value={value}>
      {children}
      <WarmIntroModal target={target} mode={mode} isOpen={open} onClose={() => setOpen(false)} />
    </IntroRequestContext.Provider>
  );
};

export function useIntroRequest(): IntroRequestContextValue {
  const ctx = useContext(IntroRequestContext);
  if (!ctx) {
    // Defensive no-op so a stray card outside the provider never throws/dead-ends.
    if (typeof console !== "undefined") {
      console.warn("useIntroRequest used outside IntroRequestProvider; intro flow unavailable.");
    }
    return { requestIntro: () => {}, enquireLead: () => {} };
  }
  return ctx;
}
