
interface SectorHeroProps {
  title: string;
  description: string;
}

const SectorHero = ({ title, description }: SectorHeroProps) => {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectorHero;
