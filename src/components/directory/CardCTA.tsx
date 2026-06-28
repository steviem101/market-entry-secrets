import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import { CARD_CTA_CONFIG, type DirectoryEntity } from "./cardCtaConfig";
import { useIntroRequest } from "./IntroRequestProvider";
import type { IntroTarget } from "./WarmIntroModal";

interface CardCTAProps {
  entity: DirectoryEntity;
  /** Required when the primary action is warm_intro / enquire. */
  target?: IntroTarget;
  /** Used when the primary action is navigate/external, and for "View profile". */
  primaryHref?: string;
  /** Secondary ("View profile" / "View details") destination. */
  secondaryHref?: string;
  /** Alternative secondary handler when there is no href. */
  onSecondary?: () => void;
  hideSecondary?: boolean;
  /** Tier/visibility gate — replaces the primary with an "Unlock with {tier}" action. */
  gated?: boolean;
  requiredTier?: string;
  onUnlock?: () => void;
  /** Extra trailing control (bookmark, add-to-calendar, etc.). */
  extra?: ReactNode;
  size?: "sm" | "default";
  className?: string;
}

/**
 * The one CTA row every directory card renders. Copy + behaviour come from
 * CARD_CTA_CONFIG keyed by entity, so wording lives in a single place.
 */
export const CardCTA = ({
  entity,
  target,
  primaryHref,
  secondaryHref,
  onSecondary,
  hideSecondary,
  gated,
  requiredTier,
  onUnlock,
  extra,
  size = "sm",
  className = "",
}: CardCTAProps) => {
  const cfg = CARD_CTA_CONFIG[entity];
  const navigate = useNavigate();
  const { requestIntro, enquireLead } = useIntroRequest();

  // Gated (tier/visibility) — never a dead end, always shows what unlocks it.
  if (gated) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          size={size}
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onUnlock) onUnlock();
            else navigate("/pricing");
          }}
        >
          {cfg.gatedLabel(requiredTier || "Growth")}
        </Button>
        {extra}
      </div>
    );
  }

  const renderPrimary = () => {
    const action = cfg.primary.action;
    const label = cfg.primary.label;
    const isIntro = action === "warm_intro" || action === "enquire";

    if (isIntro) {
      return (
        <Button
          size={size}
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!target) return;
            if (action === "enquire") enquireLead(target);
            else requestIntro(target);
          }}
        >
          <Handshake className="w-4 h-4 mr-1" />
          {label}
        </Button>
      );
    }

    if (action === "external" && primaryHref) {
      return (
        <Button size={size} className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
          <a href={primaryHref} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      );
    }

    // navigate (default)
    return (
      <Button size={size} className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
        <Link to={primaryHref || "#"}>{label}</Link>
      </Button>
    );
  };

  const renderSecondary = () => {
    if (hideSecondary || !cfg.secondary) return null;
    const label = cfg.secondary.label;
    if (secondaryHref) {
      return (
        <Button variant="outline" size={size} className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
          <Link to={secondaryHref}>{label}</Link>
        </Button>
      );
    }
    if (onSecondary) {
      return (
        <Button
          variant="outline"
          size={size}
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSecondary();
          }}
        >
          {label}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {renderPrimary()}
      {renderSecondary()}
      {extra}
    </div>
  );
};
