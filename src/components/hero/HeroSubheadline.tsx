import { HERO_CONTENT } from "./heroContent";

export const HeroSubheadline = () => {
  return (
    <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
      {HERO_CONTENT.subheadline}
    </p>
  );
};
