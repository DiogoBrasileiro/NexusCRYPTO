-- NEXO Jurídico — buckets de Storage privados. Todo acesso é via URL assinada
-- temporária gerada no servidor; nenhum bucket é público.

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('case-documents', 'case-documents', false, 26214400),
  ('office-assets', 'office-assets', false, 5242880)
on conflict (id) do nothing;

-- Path convention: case-documents/<tenant_id>/<case_id>/<file>
create policy case_documents_storage_master on storage.objects for all
  using (bucket_id = 'case-documents' and is_master())
  with check (bucket_id = 'case-documents' and is_master());

create policy case_documents_storage_tenant on storage.objects for all
  using (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1]::uuid in (select my_tenant_ids())
  )
  with check (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1]::uuid in (select my_tenant_ids())
  );

-- Path convention: office-assets/<tenant_id>/<file>
create policy office_assets_storage_master on storage.objects for all
  using (bucket_id = 'office-assets' and is_master())
  with check (bucket_id = 'office-assets' and is_master());

create policy office_assets_storage_tenant on storage.objects for all
  using (
    bucket_id = 'office-assets'
    and (storage.foldername(name))[1]::uuid in (select my_tenant_ids())
  )
  with check (
    bucket_id = 'office-assets'
    and (storage.foldername(name))[1]::uuid in (select my_tenant_ids())
  );
