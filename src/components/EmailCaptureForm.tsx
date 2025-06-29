
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";

interface EmailCaptureFormProps {
  onSubmit?: (email: string) => void;
  className?: string;
}

export const EmailCaptureForm = ({ onSubmit, className = "" }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(email);
      }
      
      console.log('Email captured:', email);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting email:', error);
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
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/90 backdrop-blur-sm border-2 border-border/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 px-6 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !email}
          size="lg"
          className="h-14 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
        >
          {isLoading ? (
            "Joining..."
          ) : (
            <>
              Join Our Community
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
