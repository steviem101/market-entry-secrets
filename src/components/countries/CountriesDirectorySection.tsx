import { useMemo, useState } from "react";
import { useCountryDirectory, CountryDirectoryEntry } from "@/hooks/useCountryDirectory";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountryCard from "./CountryCard";

interface CountriesDirectorySectionProps {
  searchQuery: string;
}

type SortMode = "featured" | "density" | "alphabetical";

const density = (c: CountryDirectoryEntry) =>
  c.case_study_count + c.mentor_count + c.agency_count + c.investor_count + c.provider_count;

const CountriesDirectorySection = ({ searchQuery }: CountriesDirectorySectionProps) => {
  const { data: countries = [], isLoading } = useCountryDirectory();
  const [strength, setStrength] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("featured");

  const strengths = useMemo(
    () =>
      Array.from(
        new Set(countries.map((c) => c.trade_relationship_strength).filter(Boolean)),
      ) as string[],
    [countries],
  );

  const sectors = useMemo(() => {
    const counts = new Map<string, number>();
    countries.forEach((c) =>
      c.key_industries.forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1)),
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);
  }, [countries]);

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = countries.filter((c) => {
      if (strength && c.trade_relationship_strength !== strength) return false;
      if (sector && !c.key_industries.includes(sector)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.key_industries.some((k) => k.toLowerCase().includes(q))
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "alphabetical") return a.name.localeCompare(b.name);
      if (sort === "density") return density(b) - density(a) || a.name.localeCompare(b.name);
      // featured first, then data density, then name
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return density(b) - density(a) || a.name.localeCompare(b.name);
    });
    return list;
  }, [countries, searchQuery, strength, sector, sort]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {strengths.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={strength === s}
                className={cn(badgeVariants({ variant: strength === s ? "default" : "outline" }), "cursor-pointer")}
                onClick={() => setStrength(strength === s ? null : s)}
              >
                {s}
              </button>
            ))}
            {strengths.length > 0 && sectors.length > 0 && (
              <span className="mx-1 text-muted-foreground">·</span>
            )}
            {sectors.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sector === s}
                className={cn(badgeVariants({ variant: sector === s ? "default" : "outline" }), "cursor-pointer")}
                onClick={() => setSector(sector === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger className="w-[190px] shrink-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured first</SelectItem>
              <SelectItem value="density">Most resources</SelectItem>
              <SelectItem value="alphabetical">A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No countries match those filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((country) => (
              <CountryCard key={country.id} country={country} featured={country.featured} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CountriesDirectorySection;
