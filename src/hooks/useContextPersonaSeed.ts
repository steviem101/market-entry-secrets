import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { usePersona } from "@/contexts/PersonaContext";

/**
 * On mount, seed the `persona` filter from the global PersonaContext when the
 * URL doesn't already specify one — restoring the pre-standardisation default
 * where a user's chosen audience pre-filters directory results. Runs once; an
 * explicit ?persona= in the URL (including after the user changes it) always wins.
 */
export function useContextPersonaSeed(setFilter: (key: string, value: string) => void) {
  const { persona } = usePersona();
  const [params] = useSearchParams();
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (persona && !params.has("persona")) setFilter("persona", persona);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
