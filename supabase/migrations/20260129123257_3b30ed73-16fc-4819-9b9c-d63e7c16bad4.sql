-- Add column for seller request status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_request_pending boolean DEFAULT false;

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new update policy that prevents users from setting is_seller themselves
-- Users can update all fields EXCEPT is_seller (which only admins can change)
CREATE POLICY "Users can update their own profile except is_seller"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND (
    -- Either is_seller stays the same
    is_seller = (SELECT p.is_seller FROM public.profiles p WHERE p.user_id = auth.uid())
    OR
    -- Or user is an admin
    public.has_role(auth.uid(), 'admin')
  )
);

-- Policy for admins to update any profile (including is_seller)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));