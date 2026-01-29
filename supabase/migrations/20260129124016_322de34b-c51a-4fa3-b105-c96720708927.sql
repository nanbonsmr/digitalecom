-- Create enum for moderation status
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Add moderation columns to products table
ALTER TABLE public.products 
ADD COLUMN moderation_status moderation_status NOT NULL DEFAULT 'pending',
ADD COLUMN moderation_notes text;

-- Drop the existing "Published products are viewable by everyone" policy
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON public.products;

-- Create new policy: Only APPROVED and published products are viewable by everyone
CREATE POLICY "Approved published products are viewable by everyone"
ON public.products
FOR SELECT
USING (is_published = true AND moderation_status = 'approved');

-- Create policy for admins to view all products for moderation
CREATE POLICY "Admins can view all products for moderation"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admins to update products (for moderation)
CREATE POLICY "Admins can update products for moderation"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);