-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price IS NULL OR original_price >= price),
  category TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view published products
CREATE POLICY "Published products are viewable by everyone"
ON public.products
FOR SELECT
USING (is_published = true);

-- Sellers can view all their own products (including unpublished)
CREATE POLICY "Sellers can view their own products"
ON public.products
FOR SELECT
USING (auth.uid() = seller_id);

-- Sellers can create their own products
CREATE POLICY "Sellers can create products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create product-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create product-thumbnails storage bucket (public for display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-thumbnails', 'product-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product files (private - only owner can access)
CREATE POLICY "Sellers can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for product thumbnails (public read)
CREATE POLICY "Product thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-thumbnails');

CREATE POLICY "Sellers can upload product thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update product thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete product thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);