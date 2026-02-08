import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReportMatchCardProps {
  name: string;
  subtitle?: string;
  tags?: string[];
  link?: string;
  linkLabel?: string;
  blurred?: boolean;
  upgradeCta?: string;
  website?: string;
}

export const ReportMatchCard = ({
  name,
  subtitle,
  tags,
  link,
  linkLabel = 'View Profile',
  blurred,
  upgradeCta,
  website,
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

  return (
    <Card className="border-border/50 border-l-[3px] border-l-primary/30 hover:border-l-primary/60 hover:shadow-sm transition-all">
      <CardContent className="p-5 space-y-3">
        {/* Name & subtitle */}
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Action buttons -- stacked below */}
        {(link || website) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {link && (
              <Link to={link}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  {linkLabel}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  Website
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
