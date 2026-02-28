import {
  Database, MapPin, Users, Calendar, DollarSign, Tag, Eye, Check, ArrowRight, FileText,
  Mail, Briefcase, Building2, Globe, User, Linkedin, BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LeadCard } from "@/components/LeadCard";
import { getSectorMeta, DEFAULT_FEATURES_BY_TYPE } from "@/constants/sectorTaxonomy";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadDatabaseDetailContentProps {
  db: LeadDatabase;
  relatedDatabases: LeadDatabase[];
  onCheckout: () => void;
  onPreview: () => void;
  checkoutLoading?: boolean;
}

/**
 * Returns an appropriate icon for a data field name.
 */
const getFieldIcon = (field: string) => {
  const lower = field.toLowerCase();
  if (lower.includes('email')) return <Mail className="w-4 h-4 text-purple-600" />;
  if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4 text-purple-600" />;
  if (lower.includes('company') || lower.includes('firm') || lower.includes('institution') || lower.includes('agency')) return <Building2 className="w-4 h-4 text-purple-600" />;
  if (lower.includes('contact') || lower.includes('name')) return <User className="w-4 h-4 text-purple-600" />;
  if (lower.includes('title') || lower.includes('role') || lower.includes('job')) return <Briefcase className="w-4 h-4 text-purple-600" />;
  if (lower.includes('website') || lower.includes('url')) return <Globe className="w-4 h-4 text-purple-600" />;
  if (lower.includes('location') || lower.includes('city') || lower.includes('state') || lower.includes('hq')) return <MapPin className="w-4 h-4 text-purple-600" />;
  if (lower.includes('revenue') || lower.includes('market cap') || lower.includes('fund')) return <BarChart3 className="w-4 h-4 text-purple-600" />;
  return <FileText className="w-4 h-4 text-purple-600" />;
};

/**
 * Generates benefit-led copy from existing database data.
 */
const generateBenefitCopy = (db: LeadDatabase) => {
  const sectorLabel = db.sector || 'your target market';
  const recordCount = db.record_count?.toLocaleString() || 'hundreds of';

  const whoFor = `Built for B2B sales teams, marketers, and founders entering the Australian ${sectorLabel} market.`;

  const included: string[] = [];
  if (db.sample_fields && db.sample_fields.length > 0) {
    // Pick the most important 3 fields
    const fields = db.sample_fields.slice(0, 3);
    fields.forEach((f) => included.push(f));
  } else {
    included.push('Verified contact details', 'Company information', 'Direct email addresses');
  }

  const outcome = `Use this data to accelerate your outreach and close your first ${recordCount} deals faster.`;

  return { whoFor, included, outcome };
};

export const LeadDatabaseDetailContent = ({
  db,
  relatedDatabases,
  onCheckout,
  onPreview,
  checkoutLoading,
}: LeadDatabaseDetailContentProps) => {
  const sectorMeta = getSectorMeta(db.sector);
  const benefitCopy = generateBenefitCopy(db);

  // Use sample_fields from DB, or fall back to defaults by list_type
  const features = (db.sample_fields && db.sample_fields.length > 0)
    ? db.sample_fields
    : DEFAULT_FEATURES_BY_TYPE[db.list_type || 'Lead Database'] || DEFAULT_FEATURES_BY_TYPE['Lead Database'];

  const ctaLabel = db.is_free
    ? 'Get Free Access'
    : db.price_aud
      ? `Get Instant Access — $${db.price_aud.toLocaleString()}`
      : 'Get Instant Access';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About — Benefit-led structure */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About This Database</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {benefitCopy.whoFor}
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">What you get:</p>
                  <ul className="space-y-1.5">
                    {benefitCopy.included.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {db.description && (
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {db.description}
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed italic">
                  {benefitCopy.outcome}
                </p>
              </div>
            </section>

            {/* What's Included — Icon-based feature grid */}
            <section>
              <h3 className="text-lg font-semibold mb-4">What's included in this list?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((field) => (
                  <div key={field} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    {getFieldIcon(field)}
                    <span className="text-sm font-medium">{field}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Preview Data CTA */}
            <section>
              <div className="border rounded-lg p-6 bg-muted/20 text-center">
                <Eye className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Want to see sample data?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview the first 5 records with masked contact details
                </p>
                <Button variant="outline" onClick={onPreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Sample Data
                </Button>
              </div>
            </section>

            {/* Tags */}
            {db.tags && db.tags.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {db.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Related Databases */}
            {relatedDatabases.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Related Databases</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/leads">View All Leads</Link>
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedDatabases.map((relDb) => (
                    <LeadCard key={relDb.id} lead={relDb} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Database Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {db.list_type && (
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{db.list_type}</dd>
                    </div>
                  )}
                  {db.record_count && (
                    <div>
                      <dt className="text-muted-foreground">Records</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {db.record_count.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {db.sector && (
                    <div>
                      <dt className="text-muted-foreground">Sector</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {sectorMeta.slug ? (
                          <Link to={`/sectors/${sectorMeta.slug}`} className="hover:text-primary">
                            {sectorMeta.label}
                          </Link>
                        ) : (
                          sectorMeta.label
                        )}
                      </dd>
                    </div>
                  )}
                  {db.location && (
                    <div>
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {db.location}
                      </dd>
                    </div>
                  )}
                  {(db.price_aud || db.is_free) && (
                    <div>
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {db.is_free ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          <span>${db.price_aud?.toLocaleString()} AUD</span>
                        )}
                      </dd>
                    </div>
                  )}
                  {db.last_updated && (
                    <div>
                      <dt className="text-muted-foreground">Last Updated</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(db.last_updated).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Provider Card */}
            {db.provider_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {db.provider_logo_url ? (
                      <img
                        src={db.provider_logo_url}
                        alt={db.provider_name}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{db.provider_name}</p>
                      <p className="text-sm text-muted-foreground">Verified Provider</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA Card */}
            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Close deals faster</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant access to {db.record_count?.toLocaleString() || 'all'} verified contacts and start outreach today.
                </p>
                <Button className="w-full" onClick={onCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? 'Loading...' : ctaLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Report Generator CTA */}
            {db.sector && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-sm">Planning to enter {sectorMeta.label}?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Get an AI-powered market entry report covering SWOT analysis, competitors, regulations, and more.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/report-creator">
                      Build your market entry plan
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
