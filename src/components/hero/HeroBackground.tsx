export const HeroBackground = () => {
  return (
    <>
      {/* Base light gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background animate-gradient-shift" />

      {/* Subtle accent tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-float" />
      <div
        className="absolute top-[60%] right-[8%] w-48 h-48 bg-accent/6 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-[30%] right-[25%] w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-[20%] left-[20%] w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-[5%] right-[40%] w-20 h-20 bg-primary/6 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />
    </>
  );
};
