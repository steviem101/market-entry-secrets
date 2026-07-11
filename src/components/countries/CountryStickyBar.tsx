import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CountryFlag } from "./CountryFlag";
import { Button } from "@/components/ui/button";

interface CountryStickyBarProps {
  countryName: string;
  countryCode: string;
  primaryCtaHref: string;
  onPrimaryClick?: () => void;
}

export const CountryStickyBar = ({
  countryName,
  countryCode,
  primaryCtaHref,
  onPrimaryClick,
}: CountryStickyBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`hidden md:block fixed left-0 right-0 top-16 z-30 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="bg-mes-card/95 backdrop-blur border-b border-mes-border">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CountryFlag countryCode={countryCode} className="w-6 h-4 rounded-sm overflow-hidden border border-mes-border" />
            <span className="text-[13px] font-medium text-mes-ink-soft truncate">
              {countryName} to Australia
            </span>
            <nav className="hidden lg:flex items-center gap-4 text-[12px] text-mes-ink-soft ml-2">
              <a href="#playbook" className="hover:text-mes-ink">Playbook</a>
              <a href="#ecosystem" className="hover:text-mes-ink">Ecosystem</a>
              <a href="#faqs" className="hover:text-mes-ink">FAQs</a>
            </nav>
          </div>
          <Button asChild size="sm" className="bg-mes-teal hover:bg-mes-teal-dark text-white">
            <Link to={primaryCtaHref} onClick={onPrimaryClick}>Generate my report</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
