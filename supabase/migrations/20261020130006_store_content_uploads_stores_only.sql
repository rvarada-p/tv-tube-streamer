-- Only accounts with a store may upload to the store-content bucket.
DROP POLICY IF EXISTS "Store owners can upload content" ON storage.objects;

CREATE POLICY "Store owners can upload content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-content'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (SELECT 1 FROM public.stores WHERE stores.user_id = auth.uid())
);
