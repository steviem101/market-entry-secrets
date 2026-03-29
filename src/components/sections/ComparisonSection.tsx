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
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { ScoreRing } from "@/components/sections/comparison/ScoreRing";
import { ComparisonRow } from "@/components/sections/comparison/ComparisonRow";
import { COMPARISON_ROWS } from "@/components/sections/comparison/comparisonData";

export const ComparisonSection = () => {
  const persona = useSectionPersona();
  const navigate = useNavigate();
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.15 });

  const googleScore = COMPARISON_ROWS.filter(r => r.google.status === "yes").length;
  const consultantScore = COMPARISON_ROWS.filter(r => r.consultant.status === "yes").length;
  const mesScore = COMPARISON_ROWS.filter(r => r.mes.status === "yes").length;
  const total = COMPARISON_ROWS.length;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20" ref={elementRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
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

          {/* Score Rings */}
          <div className="flex justify-center gap-6 sm:gap-10 mb-12">
            <ScoreRing
              label="Google / LinkedIn"
              score={googleScore}
              total={total}
              variant="weak"
              animate={isVisible}
            />
            <ScoreRing
              label="Consultants"
              score={consultantScore}
              total={total}
              variant="weak"
              animate={isVisible}
            />
            <ScoreRing
              label="MES"
              score={mesScore}
              total={total}
              variant="strong"
              animate={isVisible}
            />
          </div>

          {/* Feature Rows */}
          <div className="space-y-3">
            {COMPARISON_ROWS.map((row, i) => (
              <ComparisonRow
                key={row.feature}
                row={row}
                index={i}
                animate={isVisible}
              />
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-10 flex justify-center transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: `${COMPARISON_ROWS.length * 100 + 400}ms`,
            }}
          >
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
              onClick={() => navigate("/report-creator")}
            >
              Try it free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
