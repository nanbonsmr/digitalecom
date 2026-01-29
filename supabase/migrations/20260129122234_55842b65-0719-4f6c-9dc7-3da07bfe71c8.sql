-- Fix storage policies for product-thumbnails bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload product thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view product thumbnails (public bucket)
CREATE POLICY "Anyone can view product thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-thumbnails');

-- Allow users to update their own thumbnails
CREATE POLICY "Users can update their own product thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own thumbnails
CREATE POLICY "Users can delete their own product thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix storage policies for product-files bucket (private)
CREATE POLICY "Users can upload product files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own product files
CREATE POLICY "Users can view their own product files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own product files
CREATE POLICY "Users can update their own product files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own product files
CREATE POLICY "Users can delete their own product files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);