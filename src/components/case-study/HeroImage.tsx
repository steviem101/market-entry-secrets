interface HeroImageProps {
  url: string | null | undefined;
  alt: string | null | undefined;
  credit?: string | null | undefined;
  className?: string;
}

export const HeroImage = ({
  url,
  alt,
  credit,
  className = "",
}: HeroImageProps) => {
  if (!url) return null;

  return (
    <figure className={`relative w-full overflow-hidden rounded-xl mb-8 ${className}`}>
      <div className="aspect-[16/7] bg-muted">
        <img
          src={url}
          alt={alt ?? ""}
          loading="eager"
          className="w-full h-full object-cover"
        />
      </div>
      {credit && (
        <figcaption className="absolute bottom-0 right-0 bg-foreground/70 text-background text-[11px] px-2 py-1 rounded-tl-md">
          {credit}
        </figcaption>
      )}
    </figure>
  );
};
