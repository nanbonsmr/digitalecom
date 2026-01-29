import { useState } from "react";
import { Mail, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const NewsletterSection = () => {
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
    <section className="py-16 lg:py-20 bg-primary/5 border-y border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay in the Loop
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get notified about new products, exclusive deals, and creator tips. 
            No spam, unsubscribe anytime.
          </p>

          {/* Form */}
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 p-6 bg-success/10 rounded-2xl border border-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
              <p className="text-foreground font-medium">
                You're all set! Check your inbox for a welcome message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 rounded-xl bg-card border-2 border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                required
              />
              <Button 
                type="submit" 
                className="h-12 px-6 btn-gradient-primary rounded-xl whitespace-nowrap"
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
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              No spam
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              Unsubscribe anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
