import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = "https://xhziwveaiuhzdoutpgrh.supabase.co";
const BUCKET_NAME = "guide-attachments";

export interface GuideAttachment {
  id: string;
  content_item_id: string;
  display_name: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  download_count: number;
  sort_order: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export const useGuideAttachments = (contentItemId: string | undefined) => {
  return useQuery({
    queryKey: ['guide-attachments', contentItemId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('guide_attachments')
        .select('*')
        .eq('content_item_id', contentItemId)
        .order('sort_order');

      if (error) throw error;
      return data as GuideAttachment[];
    },
    enabled: !!contentItemId
  });
};

export const getDownloadUrl = (filePath: string) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
};

export const useDownloadAttachment = () => {
  return async (attachment: GuideAttachment) => {
    // Increment download count (fire-and-forget)
    (supabase as any).rpc('increment_download_count', {
      attachment_id: attachment.id
    }).catch(() => {});

    // Trigger download
    window.open(getDownloadUrl(attachment.file_path), '_blank');
  };
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      contentItemId,
      file,
      displayName
    }: {
      contentItemId: string;
      file: File;
      displayName: string;
    }) => {
      // Upload file to storage
      const filePath = `${contentItemId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get file extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Insert DB record
      const { data, error: dbError } = await (supabase as any)
        .from('guide_attachments')
        .insert({
          content_item_id: contentItemId,
          display_name: displayName || file.name,
          file_name: file.name,
          file_path: filePath,
          file_type: ext,
          file_size_bytes: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guide-attachments', variables.contentItemId] });
      toast({ title: 'File uploaded', description: 'Attachment added successfully.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file.',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (attachment: GuideAttachment) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete DB record
      const { error: dbError } = await (supabase as any)
        .from('guide_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;
    },
    onSuccess: (_, attachment) => {
      queryClient.invalidateQueries({ queryKey: ['guide-attachments', attachment.content_item_id] });
      toast({ title: 'File deleted', description: 'Attachment removed successfully.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  });
};

// Fetch attachment counts for multiple content items
export const useAttachmentCounts = (contentItemIds: string[]) => {
  return useQuery({
    queryKey: ['guide-attachment-counts', contentItemIds],
    queryFn: async () => {
      if (contentItemIds.length === 0) return {};

      const { data, error } = await (supabase as any)
        .from('guide_attachments')
        .select('content_item_id')
        .in('content_item_id', contentItemIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((row: { content_item_id: string }) => {
        counts[row.content_item_id] = (counts[row.content_item_id] || 0) + 1;
      });
      return counts;
    },
    enabled: contentItemIds.length > 0
  });
};

// Helper to format file size
export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// File type icon mapping
export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  doc: 'DOC',
  xlsx: 'XLSX',
  xls: 'XLS',
  csv: 'CSV',
  pptx: 'PPTX',
  ppt: 'PPT',
  zip: 'ZIP',
};
