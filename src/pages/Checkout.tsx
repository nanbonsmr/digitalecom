import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Check,
  Loader2,
  Package,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Check payment status from URL params
  const paymentParam = searchParams.get('payment');
  const paymentStatus = searchParams.get('status');
  const paymentId = searchParams.get('payment_id');
  
  // Payment is successful only if payment=success AND status is not 'failed'
  const paymentSuccess = paymentParam === 'success' && paymentStatus !== 'failed';
  const paymentFailed = paymentStatus === 'failed';

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please sign in to checkout</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to complete your purchase.
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Show failed payment message
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center max-w-lg mx-auto">
          <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-muted-foreground mb-8">
            Unfortunately, your payment could not be processed. Please try again or use a different payment method.
          </p>
          {paymentId && (
            <p className="text-sm text-muted-foreground mb-6">
              Reference: {paymentId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/checkout')} className="btn-gradient-primary">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show success page if payment completed
  if (paymentSuccess) {
    // Clear cart on successful return
    if (items.length > 0) {
      clearCart();
    }

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16">
          <CheckoutSuccess />
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart before checking out.
          </p>
          <Button asChild>
            <Link to="/#products">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDodoCheckout = async () => {
    setIsProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to checkout.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check if all items are free
      const allFree = items.every(item => item.product.is_free);
      
      if (allFree) {
        // Handle free checkout directly
        await clearCart();
        toast({
          title: "Purchase complete!",
          description: "Your free digital products are now available.",
        });
        navigate('/checkout?payment=success');
        return;
      }

      const returnUrl = `${window.location.origin}/checkout?payment=success`;

      const { data, error } = await supabase.functions.invoke('create-dodo-checkout', {
        body: {
          items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            product: {
              id: item.product.id,
              title: item.product.title,
              price: item.product.price,
              is_free: item.product.is_free,
            },
          })),
          customer_email: user.email,
          customer_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Customer',
          return_url: returnUrl,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data.free_checkout) {
        await clearCart();
        toast({
          title: "Purchase complete!",
          description: "Your free digital products are now available.",
        });
        navigate('/checkout?payment=success');
        return;
      }

      if (data.checkout_url) {
        // Redirect to Dodo Payments checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process checkout';
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 lg:py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Checkout Info */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You'll be redirected to our secure payment partner, Dodo Payments, 
                  to complete your purchase. All major credit cards and payment methods are accepted.
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleDodoCheckout}
              size="lg"
              className="w-full btn-gradient-primary h-14 text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Preparing checkout...
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Pay ${total.toFixed(2)} with Dodo
                </>
              )}
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary ({itemCount} items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {item.product.thumbnail_url ? (
                        <img
                          src={item.product.thumbnail_url}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      {item.product.is_free
                        ? "Free"
                        : `$${(item.product.price * item.quantity).toFixed(2)}`}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success" />
                    <span>Instant download after purchase</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success" />
                    <span>Lifetime access to files</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success" />
                    <span>Money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
