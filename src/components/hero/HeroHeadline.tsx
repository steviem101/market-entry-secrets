import { HERO_CONTENT } from "./heroContent";

export const HeroHeadline = () => {
  const { line1, line2 } = HERO_CONTENT.headline;

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center lg:text-left">
      <span className="text-foreground">{line1}</span>
      <br />
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {line2}
      </span>
    </h1>
  );
};
