import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export const CartSheet = () => {
  const { items, itemCount, total, removeFromCart, updateQuantity, isLoading } = useCart();
  const { user } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Sign in to view your cart</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your cart items will be saved to your account.
              </p>
            </div>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Browse our marketplace and add some products!
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/#products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {item.product.thumbnail_url ? (
                        <img
                          src={item.product.thumbnail_url}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${item.product_id}`}
                        className="font-medium text-sm hover:text-primary line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.product.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-sm">
                          {item.product.is_free ? "Free" : `$${(item.product.price * item.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-auto pt-4 space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button asChild className="w-full btn-gradient-primary" size="lg">
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/#products">Continue Shopping</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
