-- =============================================================================
-- jeeyb — segurança do painel /admin
-- Rodar no Supabase: Dashboard → SQL Editor → New query → colar tudo → Run.
--
-- PRÉ-REQUISITO: o usuário admin precisa existir em Authentication → Users
-- (Add user → e-mail + senha, com "Auto Confirm User" marcado).
-- Se ele ainda não existir, o script roda mesmo assim, mas ninguém vira admin:
-- crie o usuário e rode o script de novo (ele é idempotente).
--
-- ATENÇÃO: este script APAGA todas as policies existentes em public.products e
-- as policies de storage.objects que citam o bucket 'products', e recria só as
-- daqui. É de propósito: policies permissivas somam (OR), então uma policy
-- antiga do tipo "liberar insert pra todo mundo" manteria o buraco aberto.
-- =============================================================================

-- 1. Tabela de administradores ------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  email text unique,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

-- Cada usuário logado só enxerga a própria linha. Não há policy de
-- insert/update/delete: admin novo só entra pelo SQL Editor (ou service_role).
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- 2. Função is_admin() --------------------------------------------------------
-- security definer: consulta admin_users sem depender das policies da tabela.
-- O teste é pelo auth.uid() (nunca pelo e-mail), então cadastrar uma conta com
-- o e-mail de um admin não dá acesso a ninguém.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 3. Admin inicial ------------------------------------------------------------
do $$
declare
  admin_email constant text := 'nycollasjamesm@gmail.com';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);

  if admin_id is null then
    raise warning 'Usuário % não existe em auth.users. Crie em Authentication → Users e rode este script de novo.', admin_email;
  else
    insert into public.admin_users (user_id, email)
    values (admin_id, admin_email)
    on conflict (email) do update set user_id = excluded.user_id;
  end if;
end
$$;

-- 4. public.products: leitura pública, escrita só admin ------------------------
alter table public.products enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'products'
  loop
    execute format('drop policy %I on public.products', pol.policyname);
  end loop;
end
$$;

create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_admin_insert"
  on public.products
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "products_admin_update"
  on public.products
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products_admin_delete"
  on public.products
  for delete
  to authenticated
  using ((select public.is_admin()));

-- 5. Storage, bucket 'products': leitura pública, escrita só admin -------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (
        coalesce(qual, '') like '%bucket_id = ''products''%'
        or coalesce(with_check, '') like '%bucket_id = ''products''%'
      )
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end
$$;

create policy "products_storage_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'products');

create policy "products_storage_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy "products_storage_admin_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()))
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy "products_storage_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));

-- 6. Conferência --------------------------------------------------------------
-- Resultado esperado: 1 linha "admin" com o seu e-mail, 4 policies em
-- public.products e 4 em storage.objects (products_storage_*). Qualquer outra
-- policy de storage.objects que aparecer aqui vale pra todos os buckets: revise.
select 'admin' as tipo, email as nome, user_id::text as detalhe
from public.admin_users
union all
select 'policy ' || schemaname || '.' || tablename, policyname, cmd || ' → ' || array_to_string(roles, ', ')
from pg_policies
where (schemaname = 'public' and tablename in ('products', 'admin_users'))
   or (schemaname = 'storage' and tablename = 'objects')
order by 1, 2;
