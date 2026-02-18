-- Add new columns to profiles
alter table public.profiles 
add column if not exists role text check (role in ('farmer', 'seller', 'kisan_head')),
add column if not exists location text,
add column if not exists language text default 'en';

-- Update RLS policies to allow profile creation/updates including these new columns (existing policies should cover it but good to double check)
-- Existing policies:
-- "Public profiles are viewable by everyone."
-- "Users can insert their own profile."
-- "Users can update own profile."

-- Create a helper to handle new user signup (optional, triggered by Supabase Auth)
-- For now, we'll handle profile creation from the frontend after signup.
