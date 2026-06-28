-- Restrict guide-attachments storage bucket writes to admins only.
--
-- Context: the guide_attachments TABLE already enforces admin-only insert/update/
-- delete via RLS (has_role(auth.uid(), 'admin')), but the storage.objects policies
-- for the 'guide-attachments' bucket only checked auth.role() = 'authenticated'.
-- That let any signed-in (non-admin) user upload arbitrary files into the public
-- bucket or delete existing attachment files directly via the Storage API,
-- bypassing the admin gate on the table. This realigns the bucket with the table.
--
-- Public READ is intentionally preserved (bucket is public; downloads use the
-- public object URL), so only the INSERT and DELETE policies are tightened.

drop policy if exists "Authenticated users can upload guide attachments" on storage.objects;
drop policy if exists "Authenticated users can delete guide attachments" on storage.objects;

create policy "Admins can upload guide attachments"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'guide-attachments'
    and has_role((select auth.uid()), 'admin'::app_role)
  );

create policy "Admins can delete guide attachments"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'guide-attachments'
    and has_role((select auth.uid()), 'admin'::app_role)
  );
