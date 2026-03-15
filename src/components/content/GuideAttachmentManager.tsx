import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, FileText, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GuideAttachment,
  useGuideAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  formatFileSize,
  FILE_TYPE_ICONS
} from "@/hooks/useGuideAttachments";

const ACCEPTED_TYPES = ".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.zip";

interface GuideAttachmentManagerProps {
  contentItemId: string;
}

export const GuideAttachmentManager = ({ contentItemId }: GuideAttachmentManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GuideAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments = [], isLoading } = useGuideAttachments(contentItemId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadMutation.mutateAsync({
      contentItemId,
      file,
      displayName: displayName || file.name.replace(/\.[^/.]+$/, ''),
    });

    setDisplayName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <FileText className="w-4 h-4" />
        Manage Attachments ({attachments.length})
      </Button>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Manage Attachments</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>

          {/* Upload section */}
          <div className="space-y-3 mb-6 p-4 border rounded-lg bg-muted/30">
            <Input
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="gap-2"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                PDF, DOCX, XLSX, CSV, PPTX, ZIP
              </span>
            </div>
          </div>

          {/* Existing attachments */}
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No attachments yet. Upload a file above.
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {FILE_TYPE_ICONS[attachment.file_type] || attachment.file_type.toUpperCase()}
                      {attachment.file_size_bytes ? ` · ${formatFileSize(attachment.file_size_bytes)}` : ''}
                      {` · ${attachment.download_count} downloads`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(attachment)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.display_name}"?
              This will remove the file from storage and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
