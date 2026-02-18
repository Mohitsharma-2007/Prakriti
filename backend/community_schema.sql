-- AI Chat History Table
create table if not exists ai_chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('user', 'model')),
  text text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Chat History
alter table ai_chat_history enable row level security;
create policy "Users can view own history" on ai_chat_history for select using (auth.uid() = user_id);
create policy "Users can insert own history" on ai_chat_history for insert with check (auth.uid() = user_id);

-- Profile Updates (Location)
alter table profiles add column if not exists latitude float;
alter table profiles add column if not exists longitude float;
alter table profiles add column if not exists location_updated_at timestamp with time zone;

-- Nearby Users Function
create or replace function get_nearby_users(lat float, long float, radius_km float)
returns table (
  id uuid,
  full_name text,
  role text,
  latitude float,
  longitude float,
  distance_km float
) language plpgsql security definer as $$
begin
  return query
  select
    p.id,
    p.full_name,
    p.role,
    p.latitude,
    p.longitude,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(long)) +
        sin(radians(lat)) * sin(radians(p.latitude))
      )
    ) as distance_km
  from profiles p
  where p.id != auth.uid() -- Exclude self
  and p.latitude is not null
  and p.longitude is not null
  and (
      6371 * acos(
        cos(radians(lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(long)) +
        sin(radians(lat)) * sin(radians(p.latitude))
      )
  ) < radius_km
  order by distance_km asc;
end;
$$;
