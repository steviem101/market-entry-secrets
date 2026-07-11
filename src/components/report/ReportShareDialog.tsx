import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link2, Unlink, Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportApi } from '@/lib/api/reportApi';

interface ReportShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  shareToken: string | null;
  onTokenChange: (token: string | null) => void;
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://marketentrysecrets.com";

export const ReportShareDialog = ({
  open,
  onOpenChange,
  reportId,
  shareToken,
  onTokenChange,
}: ReportShareDialogProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shareUrl = shareToken ? `${BASE_URL}/report/shared/${shareToken}` : null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = await reportApi.generateShareToken(reportId);
      onTokenChange(token);
      toast({ title: 'Share link created', description: 'Anyone with this link can view your report.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate share link.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await reportApi.revokeShareToken(reportId);
      onTokenChange(null);
      toast({ title: 'Share link revoked', description: 'The link will no longer work.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke share link.', variant: 'destructive' });
    } finally {
      setIsRevoking(false);
    }
  };

  // The async clipboard API is blocked in in-app webviews, older iOS, and
  // sandboxed iframes (e.g. the Lovable preview) — the main mobile "Share does
  // nothing / Failed to copy" failure. Fall back to selecting the visible
  // input and using the legacy copy command before giving up.
  const legacyCopy = (): boolean => {
    const el = inputRef.current;
    if (!el) return false;
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      ok = true;
    } catch {
      ok = legacyCopy();
    }
    if (ok) {
      setCopied(true);
      toast({ title: 'Copied!', description: 'Share link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Leave the URL selected in the input so a manual copy is one gesture away.
      legacyCopy();
      toast({
        title: 'Copy blocked by this browser',
        description: 'The link is selected above — copy it manually.',
        variant: 'destructive',
      });
    }
  };

  // Native share sheet — the reliable path on mobile (works in webviews where
  // both clipboard and window.print are blocked).
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({ title: 'Market Entry Report', url: shareUrl });
    } catch (e) {
      // AbortError = user closed the sheet; anything else, fall back to copy.
      if ((e as DOMException)?.name !== 'AbortError') await handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Share Report
          </DialogTitle>
          <DialogDescription>
            Generate a public link so anyone can view the unlocked sections of this report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {shareUrl ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  readOnly
                  value={shareUrl}
                  className="text-sm font-mono"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {canNativeShare && (
                <Button onClick={handleNativeShare} className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share…
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the report sections that were available at your subscription tier when the report was generated.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevoke}
                disabled={isRevoking}
                className="text-destructive hover:text-destructive/80 gap-1.5"
              >
                {isRevoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                Revoke Link
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Generate Share Link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
