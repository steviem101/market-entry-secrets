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
        <CardContent className="p-4">
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
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{name}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {link && (
              <Link to={link}>
                <Button variant="outline" size="sm" className="gap-1 w-full">
                  {linkLabel}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1 w-full text-xs text-muted-foreground">
                  Website
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
