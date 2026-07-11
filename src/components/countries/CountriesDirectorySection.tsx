import { useMemo, useState } from "react";
import { useCountryDirectory } from "@/hooks/useCountryDirectory";
import {
  filterAndSortCountries,
  distinctStrengths,
  topSectors,
  type CountrySortMode,
} from "@/lib/countryDirectoryFilters";
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

const CountriesDirectorySection = ({ searchQuery }: CountriesDirectorySectionProps) => {
  const { data: countries = [], isLoading } = useCountryDirectory();
  const [strength, setStrength] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [sort, setSort] = useState<CountrySortMode>("featured");

  const strengths = useMemo(() => distinctStrengths(countries), [countries]);
  const sectors = useMemo(() => topSectors(countries), [countries]);

  const visible = useMemo(
    () => filterAndSortCountries(countries, { search: searchQuery, strength, sector, sort }),
    [countries, searchQuery, strength, sector, sort],
  );

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

          <Select value={sort} onValueChange={(v) => setSort(v as CountrySortMode)}>
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
