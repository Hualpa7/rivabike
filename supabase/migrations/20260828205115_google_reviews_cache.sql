-- Cache de reseñas de Google Places (New) para minimizar llamadas a la API
-- (AGENT.MD sección 12). Solo la Edge Function (rol service_role, que
-- bypassea RLS) escribe acá; el resto solo lee.
create table public.google_reviews_cache (
  place_id text primary key,
  business_name text,
  rating numeric(2,1),
  user_rating_count integer,
  google_maps_uri text,
  reviews jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_reviews_cache enable row level security;

create policy "public_read_google_reviews_cache"
  on public.google_reviews_cache
  for select
  to anon, authenticated
  using (true);

create trigger set_updated_at_google_reviews_cache
  before update on public.google_reviews_cache
  for each row execute function public.set_updated_at();
