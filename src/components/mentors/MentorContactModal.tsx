import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import type { Mentor } from "@/hooks/useMentors";

interface MentorContactModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MentorContactModal = ({ mentor, isOpen, onClose }: MentorContactModalProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    message: "",
  });

  if (!mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("mentor_contact_requests")
        .insert({
          mentor_id: mentor.id,
          requester_name: form.name,
          requester_email: form.email,
          requester_company: form.company || null,
          requester_country: form.country || null,
          message: form.message,
        });

      if (error) throw error;

      toast({ title: "Contact request sent!", description: `Your message has been sent to ${mentor.name}.` });
      setForm({ name: "", email: "", company: "", country: "", message: "" });
      onClose();
    } catch (err) {
      console.error("Error sending contact request:", err);
      toast({ title: "Failed to send message", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {mentor.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
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
              <Label htmlFor="contact-company">Company</Label>
              <Input
                id="contact-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="contact-country">Country</Label>
              <Input
                id="contact-country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                placeholder="Country of origin"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contact-message">Message *</Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder={`Hi ${mentor.name}, I'm interested in...`}
              rows={4}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
