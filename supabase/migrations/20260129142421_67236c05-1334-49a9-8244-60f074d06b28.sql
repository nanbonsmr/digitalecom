-- Add RLS policy to allow buyers to download product files they've purchased
CREATE POLICY "Buyers can download purchased product files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-files' 
  AND EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = auth.uid()
      AND o.status = 'completed'
      AND p.file_url = name
  )
);