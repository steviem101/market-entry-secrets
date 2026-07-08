import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw, EyeOff, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  suggestAnonymousAlias,
  suggestAnonymousBio,
  countryLabel,
  identityLeak,
} from "@/lib/mentorDisplay";

interface AdminMentorRow {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  archetype: string | null;
  origin_country: string | null;
  sector_tags: string[] | null;
  specialties: string[] | null;
  experience: string | null;
  is_active: boolean;
  is_anonymous: boolean;
  anonymous_alias: string | null;
  anonymous_headline: string | null;
  anonymous_company_label: string | null;
  anonymous_bio: string | null;
}

interface OverrideDraft {
  anonymous_alias: string;
  anonymous_headline: string;
  anonymous_company_label: string;
  anonymous_bio: string;
}

// Admins read the base table directly — the admin-only RLS SELECT policy
// grants it — so this page (and only this page) sees real identity alongside
// the anonymity state. Writes go through the admin-mentor-anonymity edge
// function because client write grants on community_members are revoked.
const useAdminMentors = () =>
  useQuery({
    queryKey: ["admin-mentors"],
    queryFn: async (): Promise<AdminMentorRow[]> => {
      const { data, error } = await supabase
        .from("community_members")
        .select(
          "id, name, title, company, archetype, origin_country, sector_tags, specialties, experience, is_active, is_anonymous, anonymous_alias, anonymous_headline, anonymous_company_label, anonymous_bio",
        )
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as AdminMentorRow[];
    },
  });

const LeakWarning = ({ term }: { term: string | null }) =>
  term ? (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />
      Contains "{term}" — this could reveal the mentor's identity.
    </p>
  ) : null;

const AdminMentors = () => {
  const { data: mentors = [], isLoading, refetch } = useAdminMentors();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminMentorRow | null>(null);
  const [draft, setDraft] = useState<OverrideDraft>({
    anonymous_alias: "",
    anonymous_headline: "",
    anonymous_company_label: "",
    anonymous_bio: "",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.company || "").toLowerCase().includes(q) ||
        (m.archetype || "").toLowerCase().includes(q),
    );
  }, [mentors, search]);

  const anonymousCount = mentors.filter((m) => m.is_anonymous).length;

  const callToggle = async (
    mentor: AdminMentorRow,
    isAnonymous: boolean,
    overrides?: Partial<OverrideDraft>,
  ) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-mentor-anonymity",
        {
          body: {
            mentor_id: mentor.id,
            is_anonymous: isAnonymous,
            ...(overrides ?? {}),
          },
        },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      // Public directory caches now hold the pre-toggle presentation.
      await queryClient.invalidateQueries({ queryKey: ["mentors"] });
      await queryClient.invalidateQueries({ queryKey: ["community-members"] });

      toast({
        title: isAnonymous
          ? `${mentor.name} is now anonymous`
          : `${mentor.name} is now shown with full identity`,
        description: isAnonymous
          ? `Public listing shows "${data?.public_view?.name ?? "masked identity"}". The sitemap serves the masked slug automatically; search engines pick it up on their next crawl.`
          : undefined,
      });
    } catch (err) {
      toast({
        title: "Failed to update anonymity",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openAnonymizeDialog = (mentor: AdminMentorRow) => {
    setEditing(mentor);
    setDraft({
      anonymous_alias: mentor.anonymous_alias || suggestAnonymousAlias(mentor),
      anonymous_headline: mentor.anonymous_headline || mentor.archetype || "",
      anonymous_company_label: mentor.anonymous_company_label || "",
      anonymous_bio: mentor.anonymous_bio || "",
    });
  };

  // Live preview of exactly what the public will see. Mirrors the
  // community_members_public view: blank bio → composed from structured fields.
  const previewName =
    draft.anonymous_alias.trim() || editing?.archetype || "Verified Expert";
  const previewBio =
    editing && !draft.anonymous_bio.trim()
      ? suggestAnonymousBio(editing)
      : draft.anonymous_bio.trim();

  // Advisory guard: flag admin-authored copy that would re-expose identity.
  const fieldLeak = (value: string): string | null =>
    editing ? identityLeak(value, editing.name, editing.company) : null;
  const leaks = {
    anonymous_alias: fieldLeak(draft.anonymous_alias),
    anonymous_headline: fieldLeak(draft.anonymous_headline),
    anonymous_company_label: fieldLeak(draft.anonymous_company_label),
    anonymous_bio: fieldLeak(draft.anonymous_bio),
  };
  const hasLeak = Object.values(leaks).some(Boolean);

  const saveAnonymize = async () => {
    if (!editing || hasLeak) return;
    await callToggle(editing, true, draft);
    setEditing(null);
  };

  return (
    <ProtectedRoute requireAdmin>
      <Helmet>
        <title>Admin - Mentor Anonymity | Market Entry Secrets</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mentor Anonymity</h1>
            <p className="text-muted-foreground mt-1">
              {mentors.length} mentors · {anonymousCount} anonymous
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or archetype..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Archetype</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Anonymous</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {[m.title, m.company].filter(Boolean).join(" · ")}
                    </div>
                    {m.is_anonymous && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Public alias: {m.anonymous_alias || m.archetype || "Verified Expert"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{m.archetype || "—"}</TableCell>
                  <TableCell>{countryLabel(m.origin_country) || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={m.is_active ? "secondary" : "outline"}>
                      {m.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={m.is_anonymous}
                      disabled={saving}
                      onCheckedChange={(checked) =>
                        checked ? openAnonymizeDialog(m) : callToggle(m, false)
                      }
                      aria-label={`Toggle anonymity for ${m.name}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No mentors match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Anonymize {editing?.name}</DialogTitle>
              <DialogDescription>
                These labels replace the mentor's identity everywhere public.
                Leave a field blank to use a safe auto-derived fallback
                (archetype, sectors, origin country). Never include anything
                that could identify them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Live preview of the public-facing card */}
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> What the public will see
                </div>
                <div className="font-semibold">{previewName}</div>
                <p className="text-sm text-muted-foreground mt-1">{previewBio}</p>
              </div>

              <div>
                <Label htmlFor="anon-alias">Public alias (shown as their name)</Label>
                <Input
                  id="anon-alias"
                  value={draft.anonymous_alias}
                  onChange={(e) => setDraft((d) => ({ ...d, anonymous_alias: e.target.value }))}
                  placeholder="e.g. UK Fintech Founder"
                />
                <LeakWarning term={leaks.anonymous_alias} />
              </div>
              <div>
                <Label htmlFor="anon-headline">Headline (replaces title)</Label>
                <Input
                  id="anon-headline"
                  value={draft.anonymous_headline}
                  onChange={(e) => setDraft((d) => ({ ...d, anonymous_headline: e.target.value }))}
                  placeholder="e.g. Fintech scale-up operator"
                />
                <LeakWarning term={leaks.anonymous_headline} />
              </div>
              <div>
                <Label htmlFor="anon-company">Company label (replaces company)</Label>
                <Input
                  id="anon-company"
                  value={draft.anonymous_company_label}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, anonymous_company_label: e.target.value }))
                  }
                  placeholder='e.g. "ASX-listed fintech" (blank = "Undisclosed")'
                />
                <LeakWarning term={leaks.anonymous_company_label} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="anon-bio">Anonymous bio</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() =>
                      editing &&
                      setDraft((d) => ({ ...d, anonymous_bio: suggestAnonymousBio(editing) }))
                    }
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Use suggested
                  </Button>
                </div>
                <Textarea
                  id="anon-bio"
                  value={draft.anonymous_bio}
                  onChange={(e) => setDraft((d) => ({ ...d, anonymous_bio: e.target.value }))}
                  placeholder="Blank = auto-composed from seniority, sectors and specialties. Edit for a richer, identity-free profile."
                  rows={4}
                />
                <LeakWarning term={leaks.anonymous_bio} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveAnonymize} disabled={saving || hasLeak}>
                <EyeOff className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : hasLeak ? "Resolve warnings to save" : "Anonymize"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default AdminMentors;
