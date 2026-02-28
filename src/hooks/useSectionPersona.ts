import { usePersona } from "@/contexts/PersonaContext";
import type { SectionPersona } from "@/config/personaContent";

/**
 * Returns the active persona mapped to the section-level type.
 * Falls back to "international" when no persona has been selected yet.
 */
export const useSectionPersona = (): SectionPersona => {
  const { persona } = usePersona();
  return persona === "local_startup" ? "startup" : "international";
};
