import { Check, X, Minus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type Status = "no" | "partial" | "yes";

interface ComparisonRow {
  feature: string;
  google: { status: Status; tooltip: string };
  consultant: { status: Status; tooltip: string };
  mes: { status: Status; detail: string };
}

const ROWS: ComparisonRow[] = [
  {
    feature: "Time to first insight",
    google: {
      status: "partial",
      tooltip: "Results are instant but require hours of manual research and synthesis",
    },
    consultant: {
      status: "no",
      tooltip: "Engagements typically take days to weeks before first deliverable",
    },
    mes: { status: "yes", detail: "AI report in under 10 minutes" },
  },
  {
    feature: "Cost",
    google: {
      status: "yes",
      tooltip: "Free to search, but your time is the hidden cost",
    },
    consultant: {
      status: "no",
      tooltip: "Market entry projects typically start at $10K–$50K+",
    },
    mes: { status: "yes", detail: "From $0 (free tier)" },
  },
  {
    feature: "Vetted provider matching",
    google: {
      status: "no",
      tooltip: "No vetting — results ranked by SEO, not relevance or quality",
    },
    consultant: {
      status: "partial",
      tooltip: "May recommend partners from their own network, which can be limited",
    },
    mes: { status: "yes", detail: "AI-matched from curated directory" },
  },
  {
    feature: "Custom AI market report",
    google: {
      status: "no",
      tooltip: "No structured report output — just links to sift through",
    },
    consultant: {
      status: "partial",
      tooltip: "Custom reports available but take weeks and cost thousands",
    },
    mes: { status: "yes", detail: "SWOT, competitors, leads & more" },
  },
  {
    feature: "ANZ ecosystem access",
    google: {
      status: "no",
      tooltip: "No curated directory of mentors, trade agencies, or innovation hubs",
    },
    consultant: {
      status: "partial",
      tooltip: "Access limited to the consultant's personal network",
    },
    mes: {
      status: "yes",
      detail: "Mentors, trade agencies & innovation hubs",
    },
  },
  {
    feature: "ANZ-specific data",
    google: {
      status: "partial",
      tooltip: "Some data exists but scattered across many sources, not aggregated",
    },
    consultant: {
      status: "partial",
      tooltip: "Quality depends on the individual consultant's local knowledge",
    },
    mes: { status: "yes", detail: "Purpose-built for ANZ market entry" },
  },
  {
    feature: "Continuously updated",
    google: {
      status: "partial",
      tooltip: "Web results update, but you have to re-do your research each time",
    },
    consultant: {
      status: "no",
      tooltip: "Reports are point-in-time — updates require a new engagement",
    },
    mes: { status: "yes", detail: "Live data at report generation" },
  },
];

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === "yes")
    return <Check className="w-5 h-5 text-emerald-500" />;
  if (status === "partial")
    return <Minus className="w-5 h-5 text-amber-500" />;
  return <X className="w-5 h-5 text-red-400" />;
};

const CompetitorCell = ({
  status,
  tooltip,
}: {
  status: Status;
  tooltip: string;
}) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="p-3 sm:p-4 flex justify-center items-center border-l border-border/50 cursor-help">
          <StatusIcon status={status} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ComparisonSection = () => {
  const persona = useSectionPersona();
  const navigate = useNavigate();

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
                <div className="p-3 sm:p-4 text-xs sm:text-sm font-bold text-primary text-center border-l border-primary/20 bg-primary/10">
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
                  <CompetitorCell
                    status={row.google.status}
                    tooltip={row.google.tooltip}
                  />
                  <CompetitorCell
                    status={row.consultant.status}
                    tooltip={row.consultant.tooltip}
                  />
                  <div className="p-3 sm:p-4 flex flex-col items-center justify-center border-l border-primary/20 bg-primary/10">
                    <StatusIcon status={row.mes.status} />
                    <span className="text-xs text-primary font-medium mt-1 text-center">
                      {row.mes.detail}
                    </span>
                  </div>
                </div>
              ))}

              {/* CTA Row */}
              <div className="grid grid-cols-4 gap-0 border-t border-border bg-muted/30">
                <div className="col-span-3" />
                <div className="p-3 sm:p-4 flex justify-center border-l border-primary/20 bg-primary/10">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate("/report-creator")}
                  >
                    Try it free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
