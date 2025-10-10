
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useFeaturedSectors } from "@/hooks/useSectors";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  sector: z.string().min(1, "Please select a sector"),
  target_market: z.string().min(5, "Please describe your target market"),
  company_website: z.string().url("Please enter a valid website URL").optional().or(z.literal(""))
});

type FormData = z.infer<typeof formSchema>;

interface LeadGenPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadGenPopup = ({ isOpen, onClose }: LeadGenPopupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: sectors = [] } = useFeaturedSectors();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      sector: "",
      target_market: "",
      company_website: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Submit to database
      const { error: dbError } = await supabase
        .from('lead_submissions')
        .insert([{
          email: data.email,
          phone: data.phone,
          sector: data.sector,
          target_market: data.target_market,
          company_website: data.company_website || null
        }]);

      if (dbError) throw dbError;

      // Send automated follow-up email
      const { error: emailError } = await supabase.functions.invoke('send-lead-followup', {
        body: {
          email: data.email,
          sector: data.sector,
          target_market: data.target_market
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the submission if email fails
      }

      setIsSuccess(true);
      toast({
        title: "Thank you!",
        description: "Your request has been submitted. Check your email for next steps.",
      });

      // Close popup after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        form.reset();
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                ✓
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-4">
              We'll prepare your Bespoke Market Entry Plan and send it to your inbox within 24-48 hours.
            </p>
            <p className="text-sm text-gray-500">
              This popup will close automatically...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Get Your FREE Bespoke Market Entry Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Get a comprehensive, personalized market entry strategy delivered directly to your inbox. 
            Our experts will analyze your sector and target market to create a tailored plan just for you.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+61 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.name}>
                            {sector.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Market/End Buyers *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your target market, ideal customers, or end buyers in Australia..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Get My FREE Market Entry Plan"}
              </Button>
            </form>
          </Form>

          <p className="text-xs text-gray-500 text-center">
            Your information is secure and will only be used to create your personalized market entry plan.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
