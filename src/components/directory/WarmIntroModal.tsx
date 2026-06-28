import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Send } from "lucide-react";
import { ENTITY_LABEL, type DirectoryEntity } from "./cardCtaConfig";

// Map our card entity onto the directory_submissions.submission_type CHECK
// (mentor | service_provider | trade_agency | innovation_organization |
//  investor | event | content | data_request).
const SUBMISSION_TYPE: Partial<Record<DirectoryEntity, string>> = {
  mentor: "mentor",
  service_provider: "service_provider",
  investor: "investor",
  agency: "trade_agency",
  innovation_hub: "innovation_organization",
};

export type IntroMode = "intro" | "enquiry";

export interface IntroTarget {
  entity: DirectoryEntity;
  id: string;
  name: string;
  /** Lead enquiry value signal (never a price). */
  recordCount?: number | null;
  sector?: string | null;
}

interface WarmIntroModalProps {
  target: IntroTarget | null;
  mode: IntroMode;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Persists a captured intro/enquiry into the appropriate public-funnel table
 * (anon INSERT is allowed there; everything else stays service-role / RLS).
 * A DB trigger on each table emits a `public.activity_events` row which the
 * existing slack-notify pipeline routes to #mes-ops.
 */
async function persistRequest(
  target: IntroTarget,
  mode: IntroMode,
  form: { name: string; email: string; company: string; country: string; phone: string; message: string },
): Promise<void> {
  // Lead-list enquiry -> lead_submissions. email/phone/sector/target_market are
  // NOT NULL on that table; the lead reference + requester ride in `notes`.
  if (mode === "enquiry" || target.entity === "lead_list") {
    const notes = JSON.stringify({
      content_type: "lead_enquiry",
      lead_id: target.id,
      lead_title: target.name,
      record_count: target.recordCount ?? null,
      requester_name: form.name || null,
      requester_company: form.company || null,
      requester_country: form.country || null,
      message: form.message || null,
    });
    const { error } = await supabase.from("lead_submissions").insert({
      email: form.email,
      phone: form.phone || "",
      sector: target.sector || "Not specified",
      target_market: "Australia",
      notes,
    } as any);
    if (error) throw error;
    return;
  }

  // Mentors -> dedicated table, fall back to directory_submissions.
  if (target.entity === "mentor") {
    const { error } = await (supabase as any).from("mentor_contact_requests").insert({
      mentor_id: target.id,
      requester_name: form.name,
      requester_email: form.email,
      requester_company: form.company || null,
      requester_country: form.country || null,
      message: form.message,
    });
    if (!error) return;
    // fall through to directory_submissions
  }

  // Service providers / investors / agencies / innovation hubs (and mentor fallback).
  const { error } = await supabase.from("directory_submissions").insert({
    submission_type: (SUBMISSION_TYPE[target.entity] || "data_request") as any,
    contact_email: form.email,
    form_data: {
      submission_version: 2,
      content_type: "intro_request",
      entity: target.entity,
      target_id: target.id,
      target_name: target.name,
      requester_name: form.name,
      requester_company: form.company || null,
      requester_country: form.country || null,
      message: form.message,
    } as any,
  });
  if (error) throw error;
}

export const WarmIntroModal = ({ target, mode, isOpen, onClose }: WarmIntroModalProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", country: "", phone: "", message: "" });

  if (!target) return null;

  const isEnquiry = mode === "enquiry" || target.entity === "lead_list";
  const entityLabel = ENTITY_LABEL[target.entity];

  const title = isEnquiry
    ? `Enquire about this ${entityLabel}`
    : target.name
      ? `Get a warm intro to ${target.name}`
      : "Get a warm intro";

  const description = isEnquiry
    ? "Tell us what you're after and we'll be in touch — no payment needed to enquire."
    : `We'll personally connect you with this ${entityLabel}. Tell us a little about you.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await persistRequest(target, mode, form);
      toast({
        title: isEnquiry ? "Enquiry sent!" : "Intro request sent!",
        description: isEnquiry
          ? "Thanks — our team will be in touch shortly."
          : `Thanks — we'll connect you${target.name ? ` with ${target.name}` : ""} within 48 hours.`,
      });
      setForm({ name: "", email: "", company: "", country: "", phone: "", message: "" });
      onClose();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intro-name">Name *</Label>
              <Input
                id="intro-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="intro-email">Email *</Label>
              <Input
                id="intro-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intro-company">Company</Label>
              <Input
                id="intro-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="intro-country">Country</Label>
              <Input
                id="intro-country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                placeholder="Country of origin"
              />
            </div>
          </div>
          {isEnquiry && (
            <div>
              <Label htmlFor="intro-phone">Phone</Label>
              <Input
                id="intro-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Best number to reach you"
              />
            </div>
          )}
          <div>
            <Label htmlFor="intro-message">Message *</Label>
            <Textarea
              id="intro-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder={
                isEnquiry
                  ? `I'd like to know more about "${target.name}"...`
                  : `Hi${target.name ? ` ${target.name}` : ""}, I'm interested in...`
              }
              rows={4}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {isEnquiry ? <Send className="w-4 h-4 mr-2" /> : <Handshake className="w-4 h-4 mr-2" />}
            {submitting ? "Sending..." : isEnquiry ? "Send enquiry" : "Send request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
