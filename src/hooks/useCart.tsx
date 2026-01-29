import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    original_price: number | null;
    thumbnail_url: string | null;
    is_free: boolean;
    category: string;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch or create cart when user logs in
  useEffect(() => {
    if (user) {
      fetchOrCreateCart();
    } else {
      setItems([]);
      setCartId(null);
    }
  }, [user]);

  const fetchOrCreateCart = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Try to find existing carts (may have multiple due to race conditions)
      const { data: existingCarts, error: fetchError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      let currentCartId: string;

      if (existingCarts && existingCarts.length > 0) {
        // Use the first (oldest) cart
        currentCartId = existingCarts[0].id;
      } else {
        // Create new cart
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();

        if (createError) throw createError;
        currentCartId = newCart.id;
      }

      setCartId(currentCartId);
      await fetchCartItems(currentCartId);
    } catch (error: any) {
      console.error("Error fetching/creating cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartItems = async (cartIdToFetch: string) => {
    try {
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity
        `)
        .eq("cart_id", cartIdToFetch);

      if (error) throw error;

      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        return;
      }

      // Fetch product details for each cart item
      const productIds = cartItems.map((item) => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, price, original_price, thumbnail_url, is_free, category")
        .in("id", productIds);

      if (productsError) throw productsError;

      const itemsWithProducts: CartItem[] = cartItems
        .map((item) => {
          const product = products?.find((p) => p.id === item.product_id);
          if (!product) return null;
          return {
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: {
              id: product.id,
              title: product.title,
              price: product.price,
              original_price: product.original_price,
              thumbnail_url: product.thumbnail_url,
              is_free: product.is_free || false,
              category: product.category,
            },
          };
        })
        .filter((item): item is CartItem => item !== null);

      setItems(itemsWithProducts);
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (!cartId) {
      await fetchOrCreateCart();
      return;
    }

    try {
      // Check if item already exists
      const existingItem = items.find((item) => item.product_id === productId);
      
      if (existingItem) {
        toast({
          title: "Already in cart",
          description: "This item is already in your cart.",
        });
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity: 1,
        });

      if (error) throw error;

      await fetchCartItems(cartId);
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("product_id", productId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cartId || quantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("cart_id", cartId)
        .eq("product_id", productId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error: any) {
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;

      setItems([]);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    }
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product_id === productId);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const total = items.reduce((sum, item) => {
    if (item.product.is_free) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
