import { usePersona, type Persona } from '@/contexts/PersonaContext';

type PersonaFilterValue = 'all' | 'international_entrant' | 'local_startup';

interface PersonaFilterProps {
  value?: PersonaFilterValue;
  onChange?: (value: PersonaFilterValue) => void;
}

const options: { value: PersonaFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'international_entrant', label: 'For international entrants' },
  { value: 'local_startup', label: 'For local startups' },
];

export const PersonaFilter = ({ value, onChange }: PersonaFilterProps) => {
  const { persona } = usePersona();

  // Default to user's stored persona, or 'all' if none set
  const activeValue = value ?? (persona as PersonaFilterValue) ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-muted-foreground self-center mr-1">Show:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange?.(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            activeValue === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export type { PersonaFilterValue };
