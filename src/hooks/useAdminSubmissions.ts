import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Submission {
  id: string;
  submission_type: string;
  contact_email: string;
  form_data: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
  submitter_user_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

interface UseAdminSubmissionsOptions {
  typeFilter?: string;
  statusFilter?: string;
}

export const useAdminSubmissions = ({ typeFilter, statusFilter }: UseAdminSubmissionsOptions = {}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("directory_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("submission_type", typeFilter);
      }
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast({
        title: "Failed to load submissions",
        description: "Check that you have admin permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateStatus = async (id: string, status: string, reviewNotes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates: Record<string, unknown> = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      };
      if (reviewNotes !== undefined) {
        updates.review_notes = reviewNotes;
      }

      const { error } = await (supabase as any)
        .from("directory_submissions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } as Submission : s))
      );

      toast({ title: `Status updated to "${status}"` });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return { submissions, loading, refetch: fetchSubmissions, updateStatus };
};
