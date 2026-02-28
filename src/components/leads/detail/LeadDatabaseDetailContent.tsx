import { Database, MapPin, Users, Star, Calendar, DollarSign, Lock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LeadCard } from "@/components/LeadCard";
import type { LeadDatabase, LeadDatabaseRecord } from "@/types/leadDatabase";

interface LeadDatabaseDetailContentProps {
  db: LeadDatabase;
  relatedDatabases: LeadDatabase[];
  previewRecords: LeadDatabaseRecord[];
}

export const LeadDatabaseDetailContent = ({
  db,
  relatedDatabases,
  previewRecords,
}: LeadDatabaseDetailContentProps) => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About This Database</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {db.description}
              </p>
            </section>

            {/* Sample Fields */}
            {db.sample_fields && db.sample_fields.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Data Fields Included</h3>
                <div className="flex flex-wrap gap-2">
                  {db.sample_fields.map((field) => (
                    <Badge key={field} variant="secondary" className="text-sm px-3 py-1">
                      {field}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Preview Table */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Preview Data</h3>
              {previewRecords.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Company</th>
                        <th className="text-left p-3 font-medium">Contact</th>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRecords.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="p-3">{record.company_name || '—'}</td>
                          <td className="p-3">{record.contact_name || '—'}</td>
                          <td className="p-3">{record.job_title || '—'}</td>
                          <td className="p-3">{record.city || record.state || record.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-muted/30 p-4 text-center border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Showing {previewRecords.length} of {db.record_count?.toLocaleString() || 'many'} records
                    </p>
                    <Button size="sm">
                      <Lock className="w-4 h-4 mr-1" />
                      Request Full Access
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-3">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-4 bg-muted-foreground/20 rounded" />
                      <div className="h-4 bg-muted-foreground/20 rounded" />
                      <div className="h-4 bg-muted-foreground/20 rounded" />
                      <div className="h-4 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-t p-3">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-4 bg-muted/60 rounded blur-sm" />
                        <div className="h-4 bg-muted/60 rounded blur-sm" />
                        <div className="h-4 bg-muted/60 rounded blur-sm" />
                        <div className="h-4 bg-muted/60 rounded blur-sm" />
                      </div>
                    </div>
                  ))}
                  <div className="bg-muted/30 p-4 text-center border-t">
                    <Lock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Preview data not yet available for this database
                    </p>
                    <Button size="sm">
                      Request Access
                    </Button>
                  </div>
                </div>
              )}
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
                  {db.quality_score && (
                    <div>
                      <dt className="text-muted-foreground">Quality Score</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {db.quality_score}%
                      </dd>
                    </div>
                  )}
                  {db.sector && (
                    <div>
                      <dt className="text-muted-foreground">Sector</dt>
                      <dd className="font-medium flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {db.sector}
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
                <h3 className="font-semibold mb-2">Need this data?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get full access to {db.record_count?.toLocaleString() || 'all'} records with verified contact details.
                </p>
                <Button className="w-full">
                  Request Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
