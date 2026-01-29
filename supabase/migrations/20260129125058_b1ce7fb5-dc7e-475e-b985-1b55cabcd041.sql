-- Update products RLS policies: only admins can manage products (no more seller system)

-- Drop existing seller-based product policies
DROP POLICY IF EXISTS "Sellers can create products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;

-- Create admin-only policies for product management
CREATE POLICY "Admins can create products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Update existing admin view policy to cover all operations (already exists, but let's ensure it's there)
-- The "Admins can view all products for moderation" policy already exists

-- Drop existing admin update policy (we'll use the new one above)
DROP POLICY IF EXISTS "Admins can update products for moderation" ON public.products;