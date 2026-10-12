-- =============================================================================
-- jeeyb — policies da tabela de clientes (public.profiles)
-- NECESSÁRIO pra aba Clientes e o card "Clientes cadastrados" do /admin: sem a
-- policy de leitura daqui, o admin só enxerga o próprio perfil e a lista vem vazia.
-- Também resolve perfil que não salva/carrega no checkout (no console do navegador
-- aparece "Perfil não foi salvo no Supabase").
-- Rodar no Supabase: Dashboard → SQL Editor → New query → colar tudo → Run.
--
-- Não cria nem altera colunas: usa a tabela que já existe
-- (id, full_name, phone, cpf, address_street, address_number, address_complement,
--  address_neighborhood, address_zipcode, address_city, address_state).
-- Só ADICIONA policies; as que você já tem continuam valendo.
--
-- PRÉ-REQUISITO: supabase/admin-security.sql já rodado (usa public.is_admin()).
-- ATENÇÃO: o cadastro da loja não pede CPF. Se a coluna cpf for NOT NULL, o
-- perfil não grava: nesse caso rode também
--   alter table public.profiles alter column cpf drop not null;
-- =============================================================================

alter table public.profiles enable row level security;

-- Cada cliente lê, cria e atualiza só o próprio perfil (id = id do usuário no Auth).
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Conferência: lista todas as policies da tabela (as daqui e as que já existiam).
select policyname, cmd, array_to_string(roles, ', ') as roles
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;
