export const HeroBackground = () => {
  return (
    <>
      {/* Base light gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />

      {/* Subtle accent tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
    </>
  );
};
