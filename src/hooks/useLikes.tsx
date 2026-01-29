import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UseLikesReturn {
  likeCount: number;
  isLiked: boolean;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
}

export const useLikes = (productId: string): UseLikesReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch like count and user's like status
  useEffect(() => {
    const fetchLikeData = async () => {
      // Get total like count
      const { count } = await supabase
        .from("product_likes")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

      setLikeCount(count || 0);

      // Check if current user has liked
      if (user) {
        const { data } = await supabase
          .from("product_likes")
          .select("id")
          .eq("product_id", productId)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsLiked(!!data);
      }
    };

    if (productId) {
      fetchLikeData();
    }
  }, [productId, user]);

  const toggleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like products",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("product_likes")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", user.id);

        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like
        await supabase.from("product_likes").insert({
          product_id: productId,
          user_id: user.id,
        });

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isLiked, productId, toast]);

  return { likeCount, isLiked, isLoading, toggleLike };
};

// Hook to get user's wishlist (liked products)
export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("product_likes")
        .select("product_id")
        .eq("user_id", user.id);

      setWishlist(data?.map((item) => item.product_id) || []);
      setIsLoading(false);
    };

    fetchWishlist();
  }, [user]);

  return { wishlist, isLoading };
};
