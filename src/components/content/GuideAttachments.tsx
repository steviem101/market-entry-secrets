import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, File, Lock } from "lucide-react";
import {
  GuideAttachment,
  useDownloadAttachment,
  formatFileSize,
  FILE_TYPE_ICONS
} from "@/hooks/useGuideAttachments";
import { useAuth } from "@/hooks/useAuth";

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    case 'docx':
    case 'doc':
      return <FileText className="w-5 h-5 text-blue-600" />;
    case 'pptx':
    case 'ppt':
      return <FileText className="w-5 h-5 text-orange-500" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

interface GuideAttachmentsProps {
  attachments: GuideAttachment[];
  variant?: 'sidebar' | 'inline';
}

export const GuideAttachments = ({ attachments, variant = 'sidebar' }: GuideAttachmentsProps) => {
  const downloadAttachment = useDownloadAttachment();
  const { user } = useAuth();

  if (attachments.length === 0) return null;

  const handleDownload = (attachment: GuideAttachment) => {
    // Future: if is_premium && !user, show auth gate
    if (attachment.is_premium && !user) {
      // For now, allow download. Hook point for future premium gating.
    }
    downloadAttachment(attachment);
  };

  if (variant === 'inline') {
    return (
      <div className="bg-muted/30 rounded-lg p-6 mb-8 border">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Downloads ({attachments.length})
          </h3>
        </div>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 bg-background rounded-lg p-3 border"
            >
              {getFileIcon(attachment.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {attachment.display_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{FILE_TYPE_ICONS[attachment.file_type] || attachment.file_type.toUpperCase()}</span>
                  {attachment.file_size_bytes && (
                    <>
                      <span>&middot;</span>
                      <span>{formatFileSize(attachment.file_size_bytes)}</span>
                    </>
                  )}
                  {attachment.download_count > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>{attachment.download_count} downloads</span>
                    </>
                  )}
                </div>
              </div>
              {attachment.is_premium && !user ? (
                <Button size="sm" variant="outline" disabled className="gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Sign in
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(attachment)}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sidebar variant
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">
            Downloads ({attachments.length})
          </h3>
        </div>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="space-y-2">
              <div className="flex items-start gap-2">
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {attachment.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {FILE_TYPE_ICONS[attachment.file_type] || attachment.file_type.toUpperCase()}
                    {attachment.file_size_bytes ? ` · ${formatFileSize(attachment.file_size_bytes)}` : ''}
                  </p>
                </div>
              </div>
              {attachment.is_premium && !user ? (
                <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                  <Lock className="w-3.5 h-3.5" />
                  Sign in to download
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
