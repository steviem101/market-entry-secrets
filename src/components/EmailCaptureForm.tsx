
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
      <div className={`flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-6 py-4 ${className}`}>
        <div className="flex items-center gap-2 text-primary">
          <Mail className="w-5 h-5" />
          <span className="font-medium">Thank you! We'll be in touch soon.</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${className}`}>
      <div className="flex-1">
        <Input
          type="email"
          placeholder="Your email here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 px-4 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !email}
        size="lg"
        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 py-3 rounded-xl soft-shadow hover:shadow-lg transition-all duration-300 flex items-center gap-2"
      >
        {isLoading ? (
          "Joining..."
        ) : (
          <>
            Join Our Community
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
};
