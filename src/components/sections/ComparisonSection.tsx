import { Check, X, Minus } from "lucide-react";
import { useSectionPersona } from "@/hooks/useSectionPersona";

interface ComparisonRow {
  feature: string;
  google: "no" | "partial" | "yes";
  consultant: "no" | "partial" | "yes";
  mes: "no" | "partial" | "yes";
  mesDetail?: string;
}

const ROWS: ComparisonRow[] = [
  {
    feature: "Time to first insight",
    google: "partial",
    consultant: "no",
    mes: "yes",
    mesDetail: "Under 10 minutes",
  },
  {
    feature: "Cost",
    google: "yes",
    consultant: "no",
    mes: "yes",
    mesDetail: "From $0 (free tier)",
  },
  {
    feature: "Vetted provider matching",
    google: "no",
    consultant: "partial",
    mes: "yes",
    mesDetail: "AI-matched from 500+",
  },
  {
    feature: "Custom AI market report",
    google: "no",
    consultant: "partial",
    mes: "yes",
    mesDetail: "SWOT, competitors, leads",
  },
  {
    feature: "ANZ-specific data",
    google: "partial",
    consultant: "partial",
    mes: "yes",
    mesDetail: "Purpose-built for ANZ",
  },
  {
    feature: "Continuously updated",
    google: "partial",
    consultant: "no",
    mes: "yes",
    mesDetail: "Live data + weekly curation",
  },
];

const StatusIcon = ({ status }: { status: "no" | "partial" | "yes" }) => {
  if (status === "yes")
    return <Check className="w-5 h-5 text-emerald-500" />;
  if (status === "partial")
    return <Minus className="w-5 h-5 text-amber-500" />;
  return <X className="w-5 h-5 text-red-400" />;
};

export const ComparisonSection = () => {
  const persona = useSectionPersona();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Teams Choose{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MES
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {persona === "international"
                ? "See how MES compares to the alternatives international companies typically use"
                : "See how MES compares to the tools founders typically cobble together"}
            </p>
          </div>

          {/* Comparison Table — scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm min-w-[540px]">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-0 bg-muted/50 border-b border-border">
                <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">
                  Feature
                </div>
                <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground text-center border-l border-border/50">
                  Google / LinkedIn
                </div>
                <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground text-center border-l border-border/50">
                  Consultants
                </div>
                <div className="p-3 sm:p-4 text-xs sm:text-sm font-bold text-primary text-center border-l border-border/50 bg-primary/5">
                  MES
                </div>
              </div>

              {/* Rows */}
              {ROWS.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 gap-0 ${
                    i < ROWS.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-foreground font-medium">
                    {row.feature}
                  </div>
                  <div className="p-3 sm:p-4 flex justify-center items-center border-l border-border/50">
                    <StatusIcon status={row.google} />
                  </div>
                  <div className="p-3 sm:p-4 flex justify-center items-center border-l border-border/50">
                    <StatusIcon status={row.consultant} />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col items-center justify-center border-l border-border/50 bg-primary/5">
                    <StatusIcon status={row.mes} />
                    {row.mesDetail && (
                      <span className="text-xs text-primary/80 mt-1 text-center">
                        {row.mesDetail}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
