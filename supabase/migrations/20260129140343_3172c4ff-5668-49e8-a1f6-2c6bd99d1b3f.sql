-- Add is_pinned column to products table for admin pinning
ALTER TABLE public.products ADD COLUMN is_pinned boolean DEFAULT false;

-- Create product_likes table for likes/wishlist
CREATE TABLE public.product_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_likes
CREATE POLICY "Anyone can view like counts"
ON public.product_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like products"
ON public.product_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.product_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster like count queries
CREATE INDEX idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX idx_product_likes_user_id ON public.product_likes(user_id);