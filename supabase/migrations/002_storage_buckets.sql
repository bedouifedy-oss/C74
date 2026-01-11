-- Storage Buckets Setup
-- Run this in your Supabase SQL Editor after creating buckets in the dashboard

-- Create storage buckets (run these via Supabase Dashboard > Storage > New Bucket)
-- Or use the Supabase CLI:
-- supabase storage create avatars --public
-- supabase storage create job-photos --public
-- supabase storage create documents
-- supabase storage create payment-proofs
-- supabase storage create completion-photos --public

-- Storage policies for avatars bucket (public read, authenticated write)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for job-photos bucket (public read, authenticated write)
CREATE POLICY "Job photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos');

CREATE POLICY "Authenticated users can upload job photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'job-photos');

-- Storage policies for documents bucket (private - only owner and admin)
CREATE POLICY "Workers can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Workers can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for payment-proofs bucket (private)
CREATE POLICY "Workers can view their own payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Workers can upload their own payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for completion-photos bucket (public read)
CREATE POLICY "Completion photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'completion-photos');

CREATE POLICY "Workers can upload completion photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'completion-photos');
