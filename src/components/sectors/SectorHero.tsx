
interface SectorHeroProps {
  title: string;
  description: string;
}

const SectorHero = ({ title, description }: SectorHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Industry <span className="text-primary">Sectors</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {description}
        </p>
      </div>
    </section>
  );
};

export default SectorHero;
