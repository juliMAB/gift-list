-- Tabla de regalos
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  link text,
  price text,
  image_url text,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

-- Solo vos podés leer/escribir (RLS activo)
alter table public.gifts enable row level security;

-- Cualquiera puede ver la lista (quien tenga el link)
create policy "public leer lista" on public.gifts
  for select using (true);

-- Vos podés agregar regalos con la anon key
create policy "vos insertar regalos" on public.gifts
  for insert with check (true);

-- Vos podés editar tus regalos
create policy "vos modificar regalos" on public.gifts
  for update using (true);
create policy "vos borrar regalos" on public.gifts
  for delete using (true);
