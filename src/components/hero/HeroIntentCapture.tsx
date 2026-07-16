import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classifyIntent, INTENT_CHIPS } from "@/lib/intentClassifier";
import { writeIntentPrefill } from "@/lib/heroIntentPrefill";
import { trackFunnelEvent } from "@/lib/analytics/intakeFunnel";
import { REPORT_CREATOR_PATH, REPORT_CTA_MICROCOPY } from "@/config/reportCta";
import type { ReportPersona } from "@/components/report-creator/intakeSchema.v2";

const HERO_INTENT_SOURCE = "homepage_hero";

/**
 * Intent-first hero capture (MES-158, flag `intent_hero`). A visitor types (or
 * taps a chip for) what they need to find; we classify it deterministically,
 * persist a prefill draft, and send them into the report creator with their
 * goals + focus pre-selected. No promise of "exact matches" — the wizard still
 * confirms. Ships behind the flag; the classic CTA group is the fallback.
 */
export const HeroIntentCapture = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const startedRef = useRef(false);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFunnelEvent("hero_intent_started", { source: HERO_INTENT_SOURCE });
  };

  const go = (rawIntent: string, persona?: ReportPersona, via: "typed" | "chip" = "typed") => {
    const intent = classifyIntent(rawIntent, persona);
    writeIntentPrefill(intent);
    trackFunnelEvent("hero_intent_submitted", {
      source: HERO_INTENT_SOURCE,
      persona: intent.persona,
      metadata: { via, confidence: intent.confidence, goal_ids: intent.goalIds },
    });
    navigate(REPORT_CREATOR_PATH);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    go(trimmed, undefined, "typed");
  };

  return (
    <div className="flex flex-col items-center lg:items-start gap-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <label htmlFor="hero-intent" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          What do you need to find in the Australian market?
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="hero-intent"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={markStarted}
            placeholder="e.g. a fintech lawyer, investors, market-entry mentors…"
            className="h-12 flex-1 rounded-xl bg-background/90 text-base"
            aria-label="Describe what you need to find"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!value.trim()}
            className="h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 rounded-xl soft-shadow hover:shadow-lg transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              Build my report
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      </form>

      {/* Prompt chips — each is a complete intent that classifies + navigates. */}
      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
        {INTENT_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              markStarted();
              trackFunnelEvent("hero_intent_chip_clicked", {
                source: HERO_INTENT_SOURCE,
                persona: chip.persona,
                metadata: { label: chip.label },
              });
              go(chip.intent, chip.persona, "chip");
            }}
            className="rounded-full border border-primary/20 bg-background/70 px-3.5 py-1.5 text-sm text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Trust micro-label (mirrors the classic CTA group). */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-accent" />
        <span>{REPORT_CTA_MICROCOPY}</span>
      </div>
    </div>
  );
};
