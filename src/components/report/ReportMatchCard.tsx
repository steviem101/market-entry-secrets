import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lock, Globe, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publishedOrigin } from '@/lib/publishedOrigin';

interface ReportMatchCardProps {
  name: string;
  subtitle?: string;
  tags?: string[];
  link?: string;
  linkLabel?: string;
  blurred?: boolean;
  upgradeCta?: string;
  website?: string;
  source?: string; // "web" for externally discovered matches
}

// Map raw DB enum-style content_type values to display labels for cards.
// Used as a defensive humaniser on the read path so card subtitles never
// show literals like "case_study" / "guide_pdf" / "playbook". The pipeline
// should ideally not pass the raw enum through, but this guards both paths.
const HUMANIZED_SUBTITLES: Record<string, string> = {
  case_study: 'Case Study',
  case_studies: 'Case Studies',
  guide: 'Guide',
  guide_pdf: 'Guide (PDF)',
  playbook: 'Playbook',
  report: 'Report',
  article: 'Article',
  blog_post: 'Article',
  news: 'News',
};

const humanizeSubtitle = (s?: string): string | undefined => {
  if (!s) return s;
  const lower = s.toLowerCase().trim();
  if (HUMANIZED_SUBTITLES[lower]) return HUMANIZED_SUBTITLES[lower];
  // Single-word underscore-separated enum → Title Case
  if (/^[a-z][a-z0-9_]+$/.test(lower) && !lower.includes(' ')) {
    return lower
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return s;
};

// LinkedIn URLs are stored in the website column but the card hard-coded
// "Website" — relabel + use the right icon when the URL is a LinkedIn
// profile so users aren't misled.
const isLinkedInUrl = (url: string): boolean =>
  /(?:^|\/\/(?:www\.)?)linkedin\.com\//.test(url || '');

// Print/PDF needs absolute internal links so they don't break when the
// page is exported (window.print's a[href^="/"] resolves relative to the
// report URL and the print stylesheet hides the URL annotation entirely,
// so internal links would otherwise come out as dead text).
const absolutizeForPdf = (href?: string): string | undefined => {
  if (!href) return href;
  if (href === '#') return href;
  if (/^https?:/i.test(href)) return href;
  if (href.startsWith('/')) return `${publishedOrigin()}${href}`;
  return href;
};

export const ReportMatchCard = ({
  name,
  subtitle,
  tags,
  link,
  linkLabel = 'View Profile',
  blurred,
  upgradeCta,
  website,
  source,
}: ReportMatchCardProps) => {
  if (blurred) {
    return (
      <Card className="relative overflow-hidden border-border/50">
        <CardContent className="p-5">
          <div className="filter blur-sm select-none">
            <p className="font-semibold">████████ ██████</p>
            <p className="text-sm text-muted-foreground">████████ ███ ██████</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="text-center">
              <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{upgradeCta || 'Upgrade to unlock'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isWebSource = source === 'web';
  const displaySubtitle = humanizeSubtitle(subtitle);
  const websiteIsLinkedIn = website ? isLinkedInUrl(website) : false;
  const websiteLabel = websiteIsLinkedIn ? 'LinkedIn' : 'Website';

  return (
    <Card className="border-border/50 border-l-[3px] border-l-primary/30 hover:border-l-primary/60 hover:shadow-sm transition-all">
      <CardContent className="p-5 space-y-3">
        {/* Name & subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{name}</p>
            {isWebSource && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 text-muted-foreground border-muted-foreground/30">
                <Globe className="w-2.5 h-2.5" />
                Web
              </Badge>
            )}
          </div>
          {displaySubtitle && <p className="text-sm text-muted-foreground mt-0.5">{displaySubtitle}</p>}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {(link || website) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {link && (
              isWebSource ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    {linkLabel}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              ) : (
                <>
                  {/* In-browser navigation via Link; the print-only anchor
                      below provides an absolute href so the link still
                      resolves when the report is exported to PDF. */}
                  <Link to={link} className="print:hidden">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      {linkLabel}
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                  <a
                    href={absolutizeForPdf(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden print:inline-flex"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      {linkLabel}
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                </>
              )
            )}
            {website && !isWebSource && (
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  {websiteIsLinkedIn ? <Linkedin className="w-3 h-3" /> : null}
                  {websiteLabel}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
