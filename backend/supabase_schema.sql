-- Create profiles table (public profile info)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Access policies for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create diagnoses table
create table public.diagnoses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  image_url text not null,
  disease_name text not null,
  confidence float not null,
  treatment text,
  prevention text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Access policies for diagnoses
alter table public.diagnoses enable row level security;

create policy "Users can view their own diagnoses."
  on diagnoses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own diagnoses."
  on diagnoses for insert
  with check ( auth.uid() = user_id );

-- Storage bucket for crop images (if not exists)
insert into storage.buckets (id, name, public)
values ('crop-images', 'crop-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload crop images"
  on storage.objects for insert
  with check ( bucket_id = 'crop-images' and auth.role() = 'authenticated' );

create policy "Users can view their own crop images"
  on storage.objects for select
  using ( bucket_id = 'crop-images' and auth.uid() = owner );

create policy "Public access to crop images (optional, for sharing)"
  on storage.objects for select
  using ( bucket_id = 'crop-images' ); 
