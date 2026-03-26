-- Storage policies for the 'documents' bucket.
-- Users can upload/read/delete files in their organization's folder.

-- Upload: authenticated users can insert into their org folder
create policy "Users can upload to their org folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );

-- Read: authenticated users can read from their org folder
create policy "Users can read their org files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );

-- Update: authenticated users can update files in their org folder
create policy "Users can update their org files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );

-- Delete: authenticated users can delete files in their org folder
create policy "Users can delete their org files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (
      select organization_id::text from public.profiles where id = auth.uid()
    )
  );
