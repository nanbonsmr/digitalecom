import { useState, forwardRef } from "react";
import { Mail, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const NewsletterSection = forwardRef<HTMLElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: "Invalid email",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: result.data });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already subscribed
          toast({
            title: "Already subscribed",
            description: "This email is already on our mailing list!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Successfully subscribed!",
          description: "You'll receive updates about new products and offers.",
        });
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-16 lg:py-20 bg-primary/5 border-y border-border">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 mb-4 md:mb-6">
            <Mail className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>

          {/* Header */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Stay in the Loop
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-8 px-4">
            Get notified about new products, exclusive deals, and creator tips. 
            No spam, unsubscribe anytime.
          </p>

          {/* Form */}
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 md:gap-3 p-4 md:p-6 bg-success/10 rounded-xl md:rounded-2xl border border-success/20">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-success shrink-0" />
              <p className="text-foreground font-medium text-sm md:text-base">
                You're all set! Check your inbox for a welcome message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4 sm:px-0">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 md:h-12 px-4 rounded-xl bg-card border-2 border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                required
              />
              <Button 
                type="submit" 
                className="h-11 md:h-12 px-5 md:px-6 btn-gradient-primary rounded-xl whitespace-nowrap"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" />
              Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" />
              No spam
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" />
              Unsubscribe anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
