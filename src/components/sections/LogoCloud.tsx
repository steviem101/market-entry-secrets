import { useState } from "react";
import { useFeaturedLogos } from "@/hooks/useFeaturedLogos";

/**
 * Homepage logo strip (MES-162): 8–12 real organisation logos from records
 * flagged `is_featured` in the live directories. Renders nothing until enough
 * curated records exist (see selectFeaturedLogos), so an uncurated database
 * shows no strip rather than a sparse or broken one.
 *
 * Grayscale at rest, colour on hover; images are lazy-loaded into fixed-height
 * boxes with explicit dimensions so individual logos never shift the layout.
 */
export const LogoCloud = () => {
  const { data: logos } = useFeaturedLogos();
  const [failedKeys, setFailedKeys] = useState<ReadonlySet<string>>(new Set());

  const visible = (logos ?? []).filter((logo) => !failedKeys.has(logo.key));
  if (visible.length === 0) return null;

  return (
    <section aria-label="Organisations featured in the Market Entry Secrets network" className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Providers, agencies and ecosystem partners from our live directories
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {visible.map((logo) => (
            <li key={logo.key} className="flex h-10 items-center">
              <img
                src={logo.src}
                alt={`${logo.name} logo`}
                title={logo.name}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                onError={() =>
                  setFailedKeys((prev) => {
                    const next = new Set(prev);
                    next.add(logo.key);
                    return next;
                  })
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
