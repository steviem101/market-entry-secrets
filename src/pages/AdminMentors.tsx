import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Wand2,
  PenLine,
  ListChecks,
} from "lucide-react";
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

// AI-generated copy awaiting review (mentor_anon_copy_drafts, MES-208).
// Table is admin-only via RLS; it is not in the generated types yet.
interface AnonCopyDraft {
  id: string;
  mentor_id: string;
  alias: string | null;
  headline: string | null;
  company_label: string | null;
  bio: string | null;
  best_for: string | null;
  claims: { claim: string; source: string }[];
  leak_flags: { field: string; term: string }[];
  status: "draft" | "flagged" | "approved" | "rejected";
  generated_at: string;
}

// Pending AI drafts (draft/flagged) for the review chips + dialog pre-fill.
const useAnonCopyDrafts = () =>
  useQuery({
    queryKey: ["admin-anon-copy-drafts"],
    queryFn: async (): Promise<AnonCopyDraft[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mentor_anon_copy_drafts not in generated types yet
      const { data, error } = await (supabase as any)
        .from("mentor_anon_copy_drafts")
        .select(
          "id, mentor_id, alias, headline, company_label, bio, best_for, claims, leak_flags, status, generated_at",
        )
        .in("status", ["draft", "flagged"]);
      if (error) throw error;
      return (data || []) as AnonCopyDraft[];
    },
  });

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
  const { data: aiDrafts = [] } = useAnonCopyDrafts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [editing, setEditing] = useState<AdminMentorRow | null>(null);
  const [draft, setDraft] = useState<OverrideDraft>({
    anonymous_alias: "",
    anonymous_headline: "",
    anonymous_company_label: "",
    anonymous_bio: "",
  });

  const draftByMentor = useMemo(() => {
    const map = new Map<string, AnonCopyDraft>();
    for (const d of aiDrafts) map.set(d.mentor_id, d);
    return map;
  }, [aiDrafts]);

  // The pending AI draft for the mentor currently being edited (if any).
  const activeAiDraft = editing ? draftByMentor.get(editing.id) ?? null : null;

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
  ): Promise<boolean> => {
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
      // Public caches now hold the pre-toggle presentation. Prefix-match
      // ["mentor", ...] too so an open profile tab (useMentorBySlug) refreshes.
      await queryClient.invalidateQueries({ queryKey: ["mentors"] });
      await queryClient.invalidateQueries({ queryKey: ["mentor"] });
      await queryClient.invalidateQueries({ queryKey: ["community-members"] });

      toast({
        title: isAnonymous
          ? `${mentor.name} is now anonymous`
          : `${mentor.name} is now shown with full identity`,
        description: isAnonymous
          ? `Public listing shows "${data?.public_view?.name ?? "masked identity"}". The sitemap serves the masked slug automatically; search engines pick it up on their next crawl.`
          : undefined,
      });
      return true;
    } catch (err) {
      toast({
        title: "Failed to update anonymity",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill priority: pending AI draft (the thing awaiting review) → previously
  // saved override → taxonomy-derived suggestion.
  const openAnonymizeDialog = (mentor: AdminMentorRow) => {
    const ai = draftByMentor.get(mentor.id);
    setEditing(mentor);
    setDraft({
      anonymous_alias:
        ai?.alias || mentor.anonymous_alias || suggestAnonymousAlias(mentor),
      anonymous_headline:
        ai?.headline || mentor.anonymous_headline || mentor.archetype || "",
      anonymous_company_label:
        ai?.company_label || mentor.anonymous_company_label || "",
      anonymous_bio: ai?.bio || mentor.anonymous_bio || "",
    });
  };

  const refreshDrafts = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-anon-copy-drafts"] });

  // Mark the pending draft reviewed after the copy has been published (or the
  // admin has discarded it). Failure here is non-fatal: the columns are already
  // saved; the draft simply stays pending.
  const markDraftReviewed = async (draftId: string, status: "approved" | "rejected") => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-mentor-anon-copy", {
        body: { action: "review", draft_id: draftId, status },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await refreshDrafts();
    } catch {
      toast({
        title: "Draft status not updated",
        description: "The copy was saved, but the AI draft could not be marked reviewed.",
      });
    }
  };

  // Generate (or regenerate) the AI draft for the mentor open in the dialog,
  // then pre-fill the fields from the fresh draft.
  const generateAiDraft = async () => {
    if (!editing) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-mentor-anon-copy", {
        body: { mentor_id: editing.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data?.generated?.[0];
      if (result?.error) throw new Error(`Generation failed (${result.error})`);
      await refreshDrafts();
      const fresh = result?.draft as AnonCopyDraft | undefined;
      if (fresh) {
        setDraft({
          anonymous_alias: fresh.alias || "",
          anonymous_headline: fresh.headline || "",
          anonymous_company_label: fresh.company_label || "",
          anonymous_bio: fresh.bio || "",
        });
      }
      toast({
        title:
          result?.status === "flagged"
            ? "Draft generated with leak warnings"
            : "AI draft generated",
        description:
          result?.status === "flagged"
            ? "Review the flagged terms before saving."
            : "Review and edit before publishing — nothing is public until you save.",
      });
    } catch (err) {
      toast({
        title: "Failed to generate AI copy",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Batch: queue drafts for every active anonymous mentor without a pending one.
  const generateAllDrafts = async () => {
    setBatchGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-mentor-anon-copy", {
        body: { batch: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const results: { status?: string; error?: string }[] = data?.generated || [];
      const ok = results.filter((r) => r.status).length;
      const failed = results.filter((r) => r.error).length;
      await refreshDrafts();
      toast({
        title: "Batch generation finished",
        description:
          results.length === 0
            ? "All anonymous mentors already have a pending draft."
            : `${ok} draft${ok === 1 ? "" : "s"} queued for review${failed ? `, ${failed} failed` : ""}.`,
      });
    } catch (err) {
      toast({
        title: "Batch generation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBatchGenerating(false);
    }
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
    const pendingDraft = activeAiDraft;
    const ok = await callToggle(editing, true, draft);
    if (ok && pendingDraft) {
      // Publishing the (possibly edited) copy counts as reviewing the draft.
      await markDraftReviewed(pendingDraft.id, "approved");
    }
    if (ok) setEditing(null);
  };

  const discardAiDraft = async () => {
    if (!editing || !activeAiDraft) return;
    await markDraftReviewed(activeAiDraft.id, "rejected");
    // Fall back to saved overrides / suggestion in the fields.
    setDraft({
      anonymous_alias: editing.anonymous_alias || suggestAnonymousAlias(editing),
      anonymous_headline: editing.anonymous_headline || editing.archetype || "",
      anonymous_company_label: editing.anonymous_company_label || "",
      anonymous_bio: editing.anonymous_bio || "",
    });
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateAllDrafts}
              disabled={batchGenerating || anonymousCount === 0}
            >
              <Wand2 className={`w-4 h-4 mr-2 ${batchGenerating ? "animate-pulse" : ""}`} />
              {batchGenerating ? "Generating..." : "Generate AI drafts"}
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
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
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Public alias: {m.anonymous_alias || m.archetype || "Verified Expert"}
                        </span>
                        {draftByMentor.has(m.id) && (
                          <Badge
                            variant={
                              draftByMentor.get(m.id)!.status === "flagged"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {draftByMentor.get(m.id)!.status === "flagged"
                              ? "AI draft flagged"
                              : "AI draft ready"}
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-xs"
                          onClick={() => openAnonymizeDialog(m)}
                        >
                          <PenLine className="w-3 h-3 mr-1" />
                          Edit copy
                        </Button>
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
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Label htmlFor="anon-bio">Anonymous bio</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={generateAiDraft}
                      disabled={generating}
                    >
                      <Wand2 className={`w-3 h-3 mr-1 ${generating ? "animate-pulse" : ""}`} />
                      {generating
                        ? "Generating..."
                        : activeAiDraft
                        ? "Regenerate AI copy"
                        : "Generate AI copy"}
                    </Button>
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
                      Use template
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="anon-bio"
                  value={draft.anonymous_bio}
                  onChange={(e) => setDraft((d) => ({ ...d, anonymous_bio: e.target.value }))}
                  placeholder="Blank = auto-composed from seniority, sectors and specialties. Generate AI copy for a richer, identity-free profile."
                  rows={6}
                />
                <LeakWarning term={leaks.anonymous_bio} />
              </div>

              {/* AI draft review context: server-side leak flags + claims trace */}
              {activeAiDraft && (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ListChecks className="w-3 h-3" />
                      AI draft under review — saving publishes it
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-xs text-destructive"
                      onClick={discardAiDraft}
                      disabled={saving || generating}
                    >
                      Discard draft
                    </Button>
                  </div>
                  {activeAiDraft.leak_flags.length > 0 && (
                    <div className="text-xs text-destructive flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>
                        Automated check flagged:{" "}
                        {activeAiDraft.leak_flags
                          .map((f) => `"${f.term}" in ${f.field.replace(/_/g, " ")}`)
                          .join("; ")}
                        . Rewrite or remove these before saving.
                      </span>
                    </div>
                  )}
                  {activeAiDraft.claims.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Claims trace — every claim must come from the record:
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-0.5 max-h-28 overflow-y-auto">
                        {activeAiDraft.claims.map((c, i) => (
                          <li key={i}>
                            "{c.claim}" — <span className="font-mono">{c.source}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveAnonymize} disabled={saving || hasLeak}>
                <EyeOff className="w-4 h-4 mr-2" />
                {saving
                  ? "Saving..."
                  : hasLeak
                  ? "Resolve warnings to save"
                  : editing?.is_anonymous
                  ? "Save copy"
                  : "Anonymize"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default AdminMentors;
