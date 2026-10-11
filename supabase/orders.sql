-- =============================================================================
-- jeeyb — tabela de pedidos do checkout via WhatsApp
-- Rodar no Supabase: Dashboard → SQL Editor → New query → colar tudo → Run.
--
-- PRÉ-REQUISITO: supabase/admin-security.sql já rodado (usa public.is_admin()).
-- Sem esta tabela o checkout funciona igual: o pedido só não fica salvo.
-- =============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  -- { "name": "...", "location": "Cidade / UF" }
  customer jsonb not null,
  -- [{ "product_id", "name", "brand", "size", "quantity", "unit_price" }]
  items jsonb not null,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Qualquer visitante cria pedido (login é opcional), mas só como 'pending' e
-- sem se passar por outro usuário. O total vem do navegador: confira no
-- WhatsApp antes de confirmar.
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and (user_id is null or user_id = (select auth.uid()))
  );

-- Leitura: o dono do pedido (se estava logado) e os admins.
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Mudar status ou apagar: só admin.
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete"
  on public.orders
  for delete
  to authenticated
  using ((select public.is_admin()));

-- Conferência: deve listar as 4 policies acima.
select policyname, cmd, array_to_string(roles, ', ') as roles
from pg_policies
where schemaname = 'public' and tablename = 'orders'
order by policyname;
