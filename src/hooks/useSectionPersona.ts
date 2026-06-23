import { usePersona } from "@/contexts/PersonaContext";
import type { SectionPersona } from "@/config/personaContent";

/**
 * Returns the active persona mapped to the section-level type.
 * Falls back to "default" (dual-framed copy that speaks to both audiences)
 * when no persona has been selected yet.
 */
export const useSectionPersona = (): SectionPersona => {
  const { persona } = usePersona();
  if (persona === "local_startup") return "startup";
  if (persona === "international_entrant") return "international";
  return "default";
};
