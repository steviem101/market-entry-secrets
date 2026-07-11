
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, Loader2, MailWarning } from "lucide-react";
import { NoIndex } from "@/components/common/NoIndex";

// The recovery link lands here carrying a token in the URL hash, which the
// Supabase client exchanges for a short-lived PASSWORD_RECOVERY session
// (detectSessionInUrl). Only with that session can updateUser() set a new
// password — so guard on it and give expired/cold hits a clean recovery path
// instead of a raw "Auth session missing" error (MES-33f).
type Status = "verifying" | "ready" | "invalid";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [status, setStatus] = useState<Status>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // "Request a new link" state (shown when the recovery session is invalid).
  const [resetEmail, setResetEmail] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let active = true;
    const timeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };

    // The client fires PASSWORD_RECOVERY once it has exchanged the recovery
    // token. SIGNED_IN + session covers an already-authenticated visitor.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStatus("ready");
      }
    });

    // Resolve our state without racing the async token exchange.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        setStatus("ready");
        return;
      }
      const hash = window.location.hash || "";
      // An expired/used/invalid recovery link comes back with an error param.
      if (/error/i.test(hash)) {
        setStatus("invalid");
        return;
      }
      // No token in the URL at all → cold/direct navigation.
      if (!/access_token|type=recovery/.test(hash)) {
        setStatus("invalid");
        return;
      }
      // Token present but not yet exchanged: give the client a moment, then
      // fall back to invalid if no session (and no event) has arrived.
      timeoutRef.current = setTimeout(() => {
        if (active) setStatus((s) => (s === "verifying" ? "invalid" : s));
      }, 4000);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "ready") return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        // A dropped/expired recovery session surfaces here — send the user to
        // the request-a-new-link path instead of a dead-end error toast.
        if (/session|jwt|token|expired/i.test(error.message)) {
          setStatus("invalid");
          toast.error("Your reset link has expired. Request a new one below.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Password updated successfully!");
      navigate("/");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Enter your email address");
      return;
    }
    setRequesting(true);
    try {
      // resetPassword surfaces its own success/error toast.
      await resetPassword(resetEmail.trim());
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <NoIndex />
      <div className="max-w-md mx-auto">
        <Card>
          {status === "verifying" && (
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">Verifying your reset link…</p>
            </CardContent>
          )}

          {status === "ready" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter your new password below.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {status === "invalid" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <MailWarning className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Reset link invalid or expired</CardTitle>
                <CardDescription>
                  This password reset link is no longer valid. Enter your email and we'll send a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestNewLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={requesting}>
                    {requesting ? "Sending..." : "Send a new reset link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/")}
                  >
                    Back to home
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
