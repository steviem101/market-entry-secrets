import { useSectionPersona } from "@/hooks/useSectionPersona";

const TRUST_ITEMS = [
  { label: "Austrade", description: "Australian Trade & Investment Commission" },
  { label: "DFAT", description: "Dept. of Foreign Affairs & Trade" },
  { label: "ABS", description: "Australian Bureau of Statistics" },
  { label: "TradeVic", description: "Trade Victoria" },
  { label: "NZTE", description: "NZ Trade & Enterprise" },
];

export const TrustLogosSection = () => {
  const persona = useSectionPersona();

  return (
    <section className="py-10 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {persona === "international"
              ? "Data sourced from leading Australian institutions"
              : "Intelligence sourced from trusted institutions"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center group"
                title={item.description}
              >
                <span className="text-sm font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors duration-200 tracking-wide">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
