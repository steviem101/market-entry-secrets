import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const FloatingCTAButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const navigate = useNavigate();
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].floatingCTA;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const nearFooter = scrollTop + windowHeight > documentHeight - 200;
      setIsNearFooter(nearFooter);

      setIsVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isNearFooter) return null;

  return (
    <Button
      onClick={() => navigate(content.href)}
      className="
        fixed bottom-6 right-6 z-40
        h-14 px-6
        bg-gradient-to-r from-primary to-accent
        hover:from-primary/90 hover:to-accent/90
        text-white font-semibold
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-105
        group
        animate-fade-in
      "
      size="lg"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        <span className="hidden sm:inline">{content.label}</span>
        <span className="sm:hidden">{content.shortLabel}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </Button>
  );
};
