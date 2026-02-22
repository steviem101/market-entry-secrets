import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Persona = 'international_entrant' | 'local_startup' | null;

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const STORAGE_KEY = 'mes_user_persona';

export const PersonaProvider = ({ children }: { children: ReactNode }) => {
  const [persona, setPersonaState] = useState<Persona>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'international_entrant' || stored === 'local_startup') {
        return stored;
      }
    } catch {
      // localStorage not available
    }
    return null;
  });

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    try {
      if (p) {
        localStorage.setItem(STORAGE_KEY, p);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};
