import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Mail, DollarSign, Target, Building2, Newspaper, ExternalLink, BookOpen } from "lucide-react";
import InvestorCard from "../InvestorCard";

type SourceEntry = { label: string; url: string };

function normalizeSources(raw: unknown): SourceEntry[] {
  if (!raw) return [];
  const humanize = (key: string) =>
    key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is { label?: string; url?: string } => typeof item === "object" && item !== null)
      .filter((item) => typeof item.url === "string" && item.url.startsWith("http"))
      .map((item) => ({ label: item.label || item.url!, url: item.url! }));
  }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" && (v as string).startsWith("http"))
      .map(([k, v]) => ({ label: humanize(k), url: v as string }));
  }
  return [];
}

interface InvestorContentProps {
  investor: {
    id: string;
    name: string;
    description: string;
    investor_type: string;
    location: string;
    website: string | null;
    logo: string | null;
    sector_focus: string[] | null;
    stage_focus: string[] | null;
    check_size_min: number | null;
    check_size_max: number | null;
    contact_email: string | null;
    contact_name: string | null;
    linkedin_url: string | null;
    basic_info: string | null;
    why_work_with_us: string | null;
    portfolio_companies: string[] | null;
    details: any;
  };
  relatedInvestors: any[];
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
      {children}
    </a>
  ),
};

function formatCheckSize(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export const InvestorContent = ({ investor, relatedInvestors }: InvestorContentProps) => {
  const details = investor.details || {};
  // Prefer top-level portfolio_companies column; fall back to details.portfolio_companies for legacy records
  const portfolioCompanies = Array.isArray(investor.portfolio_companies) && investor.portfolio_companies.length > 0
    ? investor.portfolio_companies
    : Array.isArray(details.portfolio_companies) ? details.portfolio_companies : [];
  const checkSize = formatCheckSize(investor.check_size_min, investor.check_size_max);
  const sources = normalizeSources(details.sources);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {investor.basic_info || investor.description}
              </ReactMarkdown>
            </div>
          </section>

          {/* Why Work With Us */}
          {investor.why_work_with_us && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Why Work With Them</h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {investor.why_work_with_us}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Sector Focus */}
          {investor.sector_focus && investor.sector_focus.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Sector Focus</h2>
              <div className="flex flex-wrap gap-2">
                {investor.sector_focus.map((sector) => (
                  <Badge key={sector} variant="secondary" className="text-sm px-3 py-1">
                    {sector}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio / Previous Investments */}
          {portfolioCompanies.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Portfolio Companies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {portfolioCompanies.map((company: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{company}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Type-specific details */}
          {details.fund_size && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Fund Details</h2>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Fund Size:</span>
                  <span className="text-muted-foreground">{details.fund_size}</span>
                </div>
              </div>
            </section>
          )}

          {details.eligibility && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">{details.eligibility}</p>
              {details.benefit && (
                <div className="mt-3 bg-teal-50 dark:bg-teal-950 rounded-lg p-4">
                  <span className="font-medium text-teal-700 dark:text-teal-300">Benefit: </span>
                  <span className="text-teal-600 dark:text-teal-400">{details.benefit}</span>
                </div>
              )}
            </section>
          )}

          {details.program_length && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Program Details</h2>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div><span className="font-medium">Program Length:</span> <span className="text-muted-foreground">{details.program_length}</span></div>
                {details.cohort_size && <div><span className="font-medium">Cohort Size:</span> <span className="text-muted-foreground">{details.cohort_size}</span></div>}
                {details.equity && <div><span className="font-medium">Equity:</span> <span className="text-muted-foreground">{details.equity}</span></div>}
                {details.focus && <div><span className="font-medium">Focus:</span> <span className="text-muted-foreground">{details.focus}</span></div>}
              </div>
            </section>
          )}

          {/* Latest News */}
          {Array.isArray(details.latest_news) && details.latest_news.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Latest News</h2>
              <div className="space-y-3">
                {details.latest_news.map((item: { headline?: string; url?: string; date?: string }, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                    <Newspaper className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {item.headline || "News item"}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm font-medium">{item.headline || "News item"}</span>
                      )}
                      {item.date && (
                        <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources / References */}
          {sources.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Sources</h2>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 break-all"
                    >
                      {source.label}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">Research citations used to build this profile.</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* At a Glance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">At a Glance</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{investor.location}</span>
              </div>
              {checkSize && (
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{checkSize}</span>
                </div>
              )}
              {investor.stage_focus && investor.stage_focus.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{investor.stage_focus.join(", ")}</span>
                </div>
              )}
              {investor.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={investor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {investor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
              {investor.contact_email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${investor.contact_email}`} className="text-primary hover:underline truncate">
                    {investor.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stage Focus Quick View */}
          {investor.stage_focus && investor.stage_focus.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Investment Stages</h3>
              <div className="flex flex-wrap gap-1.5">
                {investor.stage_focus.map((stage) => (
                  <Badge key={stage} variant="outline" className="text-xs">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Investors */}
      {relatedInvestors && relatedInvestors.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Related Investors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedInvestors.map((related) => (
              <InvestorCard key={related.id} investor={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
