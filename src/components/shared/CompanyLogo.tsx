import { useState, useEffect } from "react";
import { getLogoUrl } from "@/lib/logoUtils";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { px: 24, container: "w-6 h-6", text: "text-[10px]" },
  md: { px: 40, container: "w-10 h-10", text: "text-sm" },
  lg: { px: 64, container: "w-16 h-16", text: "text-lg" },
  xl: { px: 128, container: "w-28 h-28", text: "text-3xl" },
  "2xl": { px: 128, container: "w-32 h-32", text: "text-3xl" },
} as const;

type LogoSize = keyof typeof SIZE_MAP;

interface CompanyLogoProps {
  websiteUrl?: string | null;
  existingLogoUrl?: string | null;
  companyName: string;
  size?: LogoSize;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
}

/**
 * Displays a company logo with a 3-tier fallback:
 * 1. Existing logo URL from the database (manual override)
 * 2. Logo.dev URL constructed from the website domain
 * 3. Initials in a coloured circle
 */
const CompanyLogo = ({
  websiteUrl,
  existingLogoUrl,
  companyName,
  size = "md",
  className,
  fallbackClassName = "bg-gradient-to-br from-primary/10 to-primary/20 text-primary",
  imgClassName = "object-contain",
}: CompanyLogoProps) => {
  const sizeConfig = SIZE_MAP[size];
  const [imgFailed, setImgFailed] = useState(false);
  const [useSecondary, setUseSecondary] = useState(false);

  // Determine which image source to try
  const logoDevUrl = getLogoUrl(websiteUrl, sizeConfig.px);
  const primarySrc = existingLogoUrl || logoDevUrl;
  // If the existing logo fails, try Logo.dev as secondary (only if they're different)
  const secondarySrc = existingLogoUrl && logoDevUrl && existingLogoUrl !== logoDevUrl ? logoDevUrl : null;

  // Reset state when source URLs change (prevents stale failure state in lists)
  useEffect(() => {
    setImgFailed(false);
    setUseSecondary(false);
  }, [existingLogoUrl, websiteUrl]);

  const currentSrc = useSecondary ? secondarySrc : primarySrc;
  const showImage = currentSrc && !imgFailed;

  const handleError = () => {
    if (!useSecondary && secondarySrc) {
      setUseSecondary(true);
    } else {
      setImgFailed(true);
    }
  };

  const initials = getCompanyInitials(companyName);

  return (
    <div
      className={cn(
        sizeConfig.container,
        "rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
        !showImage && fallbackClassName,
        className
      )}
    >
      {showImage ? (
        <img
          loading="lazy"
          src={currentSrc!}
          alt={`${companyName} logo`}
          className={cn("w-full h-full p-1.5", imgClassName)}
          onError={handleError}
        />
      ) : (
        <span className={cn("font-bold", sizeConfig.text)}>
          {initials || "?"}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;
