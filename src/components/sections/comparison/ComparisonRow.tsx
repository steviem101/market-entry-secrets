import { Check, X, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ComparisonRowData, Status } from "./comparisonData";

const statusConfig: Record<Status, { icon: typeof Check; pillClass: string }> = {
  yes: {
    icon: Check,
    pillClass: "bg-primary/10 text-primary border-primary/20",
  },
  partial: {
    icon: Minus,
    pillClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  no: {
    icon: X,
    pillClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const StatusPill = ({
  status,
  pill,
  tooltip,
}: {
  status: Status;
  pill: string;
  tooltip?: string;
}) => {
  const { icon: Icon, pillClass } = statusConfig[status];
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${pillClass} transition-transform hover:scale-105 ${
        tooltip ? "cursor-help" : ""
      }`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {pill}
    </span>
  );

  if (!tooltip) return content;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface ComparisonRowProps {
  row: ComparisonRowData;
  index: number;
  animate: boolean;
}

export const ComparisonRow = ({ row, index, animate }: ComparisonRowProps) => {
  return (
    <div
      className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-2 sm:gap-4 rounded-xl px-3 sm:px-5 py-3 sm:py-4 bg-card/60 backdrop-blur-sm border border-border/50 transition-all duration-500 hover:border-primary/20 hover:shadow-md"
      style={{
        opacity: animate ? 1 : 0,
        transform: animate ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 100 + 200}ms`,
      }}
    >
      {/* Feature label */}
      <div className="text-xs sm:text-sm font-semibold text-foreground">
        {row.feature}
      </div>

      {/* Google pill */}
      <div className="flex justify-center">
        <StatusPill
          status={row.google.status}
          pill={row.google.pill}
          tooltip={row.google.tooltip}
        />
      </div>

      {/* Consultant pill */}
      <div className="flex justify-center">
        <StatusPill
          status={row.consultant.status}
          pill={row.consultant.pill}
          tooltip={row.consultant.tooltip}
        />
      </div>

      {/* MES pill — highlighted */}
      <div className="flex justify-center relative">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10">
          <Check className="w-3.5 h-3.5 shrink-0" />
          {row.mes.pill}
        </span>
      </div>
    </div>
  );
};
