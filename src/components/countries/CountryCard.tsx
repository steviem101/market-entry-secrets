import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import { CountryData } from "@/hooks/useCountries";
import { CountryFlag } from "./CountryFlag";
import { getCountryCode } from "@/lib/countryCodes";
import { Link } from "react-router-dom";

interface CountryCardProps {
  country: CountryData;
  featured?: boolean;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex-1 min-w-0 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold text-foreground tabular-nums truncate">{value}</div>
  </div>
);

const CountryCard = ({ country, featured = false }: CountryCardProps) => {
  const economicData = country.economic_indicators;
  const countryCode = getCountryCode(country.slug);

  const stats: { label: string; value: string }[] = [];
  if (economicData?.gdp) stats.push({ label: "GDP", value: String(economicData.gdp) });
  if (economicData?.population) stats.push({ label: "Population", value: String(economicData.population) });
  if (economicData?.trade_volume_aud)
    stats.push({ label: "Trade (AUD)", value: String(economicData.trade_volume_aud) });

  return (
    <Link to={`/countries/${country.slug}`} className="group block h-full">
      <Card
        className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
          featured ? "ring-1 ring-primary/40 shadow-sm" : ""
        }`}
      >
        <CardHeader className="space-y-3">
          {featured && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-primary">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <CountryFlag
                countryCode={countryCode}
                className="w-7 h-5 shrink-0 rounded-sm overflow-hidden border border-border inline-flex items-center justify-center bg-muted text-muted-foreground"
              />
              <CardTitle className="text-xl truncate">{country.name}</CardTitle>
            </div>
            {country.trade_relationship_strength && (
              <Badge
                variant={
                  country.trade_relationship_strength === "Strong"
                    ? "default"
                    : country.trade_relationship_strength === "Growing"
                    ? "secondary"
                    : "outline"
                }
                className="shrink-0"
              >
                {country.trade_relationship_strength}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{country.description}</p>

          {stats.length > 0 && (
            <div className="flex gap-2 mb-4">
              {stats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          )}

          {country.key_industries.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Key Industries:</p>
              <div className="flex flex-wrap gap-1">
                {country.key_industries.slice(0, 3).map((industry) => (
                  <Badge key={industry} variant="outline" className="text-xs">
                    {industry}
                  </Badge>
                ))}
                {country.key_industries.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{country.key_industries.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <span className="mt-auto pt-4 inline-flex items-center text-sm font-medium text-primary">
            View country playbook
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CountryCard;
