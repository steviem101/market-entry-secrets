
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailCaptureFormProps {
  onSubmit?: (email: string) => void;
  className?: string;
  source?: string;
  buttonText?: string;
}

export const EmailCaptureForm = ({ onSubmit, className = "", source = "homepage_hero", buttonText = "Uncover Secrets" }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save email to Supabase
      const { error } = await supabase
        .from('lead_submissions')
        .insert([
          {
            email: email,
            source: source
          }
        ]);

      if (error) {
        console.error('Error saving email lead:', error);
        toast({
          title: "Submission Error",
          description: "There was an issue saving your email. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(email);
      }
      
      setIsSubmitted(true);
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Thank you for joining our community. We'll be in touch soon!",
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting email:', error);
      toast({
        title: "Submission Error",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/20 border-2 border-primary/30 rounded-2xl px-8 py-6 ${className}`}>
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Thank you!</div>
            <div className="text-sm">We'll be in touch soon with exclusive access.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex flex-col gap-2">
        <Input
          type="email"
          placeholder="Your email here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 px-3 text-sm rounded-lg border border-border/40 bg-white/90 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/60"
        />
        <Button
          type="submit"
          disabled={isLoading || !email}
          size="sm"
          className="h-10 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            "Joining..."
          ) : (
            <>
              {buttonText}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
