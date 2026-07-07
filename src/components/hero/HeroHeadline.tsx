import { HERO_CONTENT } from "./heroContent";
import { RotatingText } from "@/components/RotatingText";

export const HeroHeadline = () => {
  const { prefix, rotatingWords, suffix } = HERO_CONTENT.headline;

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center lg:text-left">
      <span className="text-foreground">{prefix} </span>
      <RotatingText
        words={rotatingWords}
        duration={2500}
        loop
        className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
      />
      <br className="hidden sm:block" />
      <span className="text-foreground"> {suffix}</span>
    </h1>
  );
};
