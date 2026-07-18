/**
 * X-not-Y manifesto (MES-188 charter §5b) — honest because of the grounding
 * invariant: every recommendation traces to a directory record. Shared by the
 * legacy HowItWorksSection (hero_journey off) and the journey section's
 * closing strip (hero_journey on), so the copy exists exactly once.
 */
const MANIFESTO: { x: string; y: string }[] = [
  { x: "Recommendations that trace to real providers", y: "not AI guesses" },
  { x: "A plan", y: "not a PDF" },
  { x: "Warm introductions", y: "not a contact list" },
];

export const ManifestoStrip = ({ className = "" }: { className?: string }) => (
  <ul className={`grid grid-cols-1 gap-4 text-center sm:grid-cols-3 ${className}`}>
    {MANIFESTO.map((line) => (
      <li key={line.y} className="text-sm leading-relaxed">
        <span className="font-semibold text-foreground">{line.x}</span>
        <span className="text-muted-foreground"> — {line.y}.</span>
      </li>
    ))}
  </ul>
);
