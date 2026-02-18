-- Allow public access to diagnoses
alter table public.diagnoses disable row level security;

-- Allow public access to storage bucket
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'crop-images' );

create policy "Public Select"
on storage.objects for select
using ( bucket_id = 'crop-images' );
